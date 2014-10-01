'use strict';

var _ = require('lodash');
var q = require('q');
var moment = require('moment');
var url;
var host = process.env.JIRA_HOST;
var username = process.env.JIRA_USERNAME;
var password = process.env.JIRA_PASSWORD;
var filter = process.env.JIRA_FILTER;
var statuses = process.env.JIRA_STATUSES;

var Jira = module.exports = function () {
	var dates;
	
	this.setDates = function (d) {
		dates = d;
		return this;
	};
	
	this.get = function () {
		var currentDate = new Date();
		var completed = 0;
		var deferred = q.defer();
		var developers = {};
		var weights = {};
		
		console.log('Performing API calls...');
		_.each(dates, function (date) {
			url = 'https://' + host + '/rest/api/latest/search?maxResults=100&jql=status was in (' + statuses + ') DURING ("' + date + ' 00:00", "' + date +' 23:59") and (' + filter + ') and assignee is not EMPTY';
			
			var request = require('request');
			request.get({url: url, json: true}, function (error, response, body) {
				if (error) {
					console.error(error);
					deferred.reject(error);
				}
				else if (response.statusCode == 200) {
					_.each(body.issues, function (issue) {
						// group by assignee
						if (!developers[issue.fields.assignee.name]) {
							weights[issue.fields.assignee.name] = {};
							developers[issue.fields.assignee.name] = {};
							_.each(dates, function (date) {
								weights[issue.fields.assignee.name][date] = 0;
								developers[issue.fields.assignee.name][date] = {};
							});
						}
						
						if (issue.fields.parent) {
							if (!developers[issue.fields.assignee.name][date][issue.fields.parent.key]) {
								weights[issue.fields.assignee.name][date] = 1;
								developers[issue.fields.assignee.name][date][issue.fields.parent.key] = {
									weight: 1,
									hours: 0,
									issue: issue.fields.parent,
									subtasks: []
								};
							}
							else {
								weights[issue.fields.assignee.name][date] = weights[issue.fields.assignee.name][date] + 1;
								developers[issue.fields.assignee.name][date][issue.fields.parent.key].weight = developers[issue.fields.assignee.name][date][issue.fields.parent.key].weight + 1;
							}
							developers[issue.fields.assignee.name][date][issue.fields.parent.key].subtasks.push(issue);
						}
						else {
							weights[issue.fields.assignee.name][date] = weights[issue.fields.assignee.name][date] + 1;
							developers[issue.fields.assignee.name][date][issue.key] = {
								weight: 1,
								hours: 0,
								issue: issue,
								subtasks: []
							};
						}
					});
					
					completed++;
					
					// if all API calls completed
					if (completed == dates.length) {
						console.log('API calls completed.');
						console.log('');
						
						// calculate hours
						_.each(developers, function (developer, name) {
							_.each(developer, function (logs, date) {
								var totalHours = 0;
								
								_.each(logs, function (log, key) {
									var hours = 8*log.weight/weights[name][date];
									var roundedHours = 0;
									
									if (key+1 == Object.keys(logs).length) {
										roundedHours = 8 - totalHours;
									}
									else {
										roundedHours = Math.round(hours*4)/4;
									}
									if (roundedHours <= 0) {
										roundedHours = 0;
									}
									totalHours = totalHours + roundedHours;
									
									log.hours = roundedHours;
								});
							});
						});
						
						// display results
						_.each(developers, function (developer, name) {
							console.log(name);
							_.each(developer, function (logs, date) {
								console.log('- ' + date);
								_.each(logs, function (log, key) {
									console.log('-- ' + log.issue.key + ' ' + log.issue.fields.summary + ': ' + log.hours + ' hours');
								});
							});
							console.log('')
						});
						
						// convert data for easy rendering in html table
						var developersTable = {};
						_.each(developers, function (developer, name) {
							developersTable[name] = {};
							
							_.each(developer, function (logs, date) {
								_.each(logs, function (log) {
									if (!developersTable[name][log.issue.key]) {
										developersTable[name][log.issue.key] = {
											issue: log.issue,
											subtasks: log.subtasks,
											dates: {}
										};
										_.each(dates, function (date) {
											developersTable[name][log.issue.key].dates[date] = 0;
										});
									}
									if (moment(date, 'YYYY/MM/DD').valueOf() <= currentDate.getTime()) {
										developersTable[name][log.issue.key].dates[date] = log.hours;
									}
								});
							});
						});
						
						deferred.resolve(developersTable);
					}
				}
			}).auth(username, password);
		});
		
		return deferred.promise;
	};
};
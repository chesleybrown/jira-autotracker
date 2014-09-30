'use strict';

var _ = require('lodash');
var q = require('q');
var url;
var host = process.env.JIRA_HOST;
var username = process.env.JIRA_USERNAME;
var password = process.env.JIRA_PASSWORD;
var filter = process.env.JIRA_FILTER;
var statuses = process.env.JIRA_STATUSES;

var Jira = module.exports = function () {
	var dates = [
		'2014/09/22',
		'2014/09/23',
		'2014/09/24',
		'2014/09/25',
		'2014/09/26'
	];
	var developers = {};
	
	var completed = 0;
	
	this.setDates = function (d) {
		dates = d;
	};
	
	this.get = function () {
		var deferred = q.defer();
		
		console.log('Performing API calls...');
		_.each(dates, function (date) {
			url = 'https://' + host + '/rest/api/latest/search?maxResults=100&jql=status was in (' + statuses + ') DURING ("' + date + ' 00:00", "' + date +' 23:59") and (' + filter + ')';
			
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
							developers[issue.fields.assignee.name] = {};
							_.each(dates, function (date) {
								developers[issue.fields.assignee.name][date] = [];
							});
						}
						developers[issue.fields.assignee.name][date].push({
							hours: 0,
							issue: issue
						});
					});
					
					completed++;
					
					// if all API calls completed
					if (completed == dates.length) {
						console.log('API calls completed.');
						console.log('');
						
						// calculate hours
						_.each(developers, function (developer, name) {
							_.each(developer, function (date) {
								var totalHours = 0;
								
								_.each(date, function (info, key) {
									var hours = 8/date.length;
									var roundedHours = 0;
									
									if (key+1 == date.length) {
										roundedHours = 8 - totalHours;
									}
									else {
										roundedHours = (250 * Math.round(hours*1000/250))/1000;
									}
									if (roundedHours < 0) {
										roundedHours = 0;
									}
									totalHours = totalHours + roundedHours;
									
									info.hours = roundedHours;
									
								});
							});
						});
						
						// display results
						_.each(developers, function (developer, name) {
							console.log(name);
							_.each(developer, function (date, key) {
								console.log('- ' + key);
								_.each(date, function (info) {
									console.log('-- ' + info.issue.key + ' ' + info.issue.fields.summary + ': ' + info.hours + ' hours');
								});
							});
							console.log('')
						});
						
						// convert data for easy rendering in html table
						var developersTable = {};
						_.each(developers, function (developer, name) {
							developersTable[name] = {};
							
							_.each(developer, function (date, key) {
								_.each(date, function (info) {
									if (!developersTable[name][info.issue.key]) {
										developersTable[name][info.issue.key] = {};
									}
									if (!developersTable[name][info.issue.key][key]) {
										developersTable[name][info.issue.key][key] = 0;
									}
									developersTable[name][info.issue.key][key] = developersTable[name][info.issue.key][key] + info.hours;
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
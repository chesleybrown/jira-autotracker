'use strict';

var _ = require('lodash');
var url;
var host = process.env.JIRA_HOST;
var username = process.env.JIRA_USERNAME;
var password = process.env.JIRA_PASSWORD;

var dates = [
	'2014/09/22',
	'2014/09/23',
	'2014/09/24',
	'2014/09/25',
	'2014/09/26'
];
var developers = {};

var completed = 0;

console.log('Performing API calls...');
_.each(dates, function (date) {
	url = 'https://' + host + '/rest/api/latest/search?jql=status was "In Progress" DURING ("' + date + ' 00:00", "' + date +' 23:59") and (project = "BLN API" or project = "BLN Web")';
	
	var request = require('request');
	request.get({url: url, json: true}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
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
								roundedHours = (5 * Math.round(hours*10/5))/10;
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
			}
		}
	}).auth(username, password);
});
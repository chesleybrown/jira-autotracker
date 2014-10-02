var moment = require('moment');
var Jira = require('./jira');

var jira = new Jira();

var format = 'YYYY/MM/DD';
date = moment().startOf('week').format(format);

var dates = [
	moment(date, format).day(1).format(format),
	moment(date, format).day(2).format(format),
	moment(date, format).day(3).format(format),
	moment(date, format).day(4).format(format),
	moment(date, format).day(5).format(format)
];

jira
	.setDates(dates)
	.get()
;
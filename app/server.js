var express = require('express');
var moment = require('moment');
var Jira = require('./jira');

var app = express();

app.set('views', __dirname);
app.set('view engine', 'jade');

app.get('/', function (req, res) {
	var jira = new Jira();
	var date = req.query.date;
	var format = 'YYYY/MM/DD';
	
	if (!date) {
		date = moment().startOf('week').format('YYYY/MM/DD');
	}
	
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
		.then(function (developers) {
			res.render('timesheet', {
				previousWeek: moment(date, format).day(-7).format(format),
				currentWeek: moment(date, format).day(1).format(format) + ' - ' + moment(date, format).day(5).format(format),
				nextWeek: moment(date, format).day(7).format(format),
				dates: dates,
				developers: developers
			});
		})
		.catch(function (error) {
			console.log(error);
			res.send('Error');
		})
	;
});


app.listen(process.env.PORT);
console.log('Express started on port ' + process.env.PORT);
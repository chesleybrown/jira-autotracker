var express = require('express');
var Jira = require('./jira');

var app = express();
var jira = new Jira();

app.set('views', __dirname);
app.set('view engine', 'jade');

app.get('/', function (req, res) {
	var dates = [
		'2014/09/22',
		'2014/09/23',
		'2014/09/24',
		'2014/09/25',
		'2014/09/26'
	];
	
	jira
		.get()
		.then(function (developers) {
			res.render('timesheet', {
				dates: dates,
				developers: developers
			});
		})
		.catch(function (error) {
			res.send('Error');
		})
	;
});


app.listen(process.env.PORT);
console.log('Express started on port ' + process.env.PORT);
var common = require('common');

var dateId = function(date) {
	return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
};
exports.dateId = dateId;

var hour = function(date) {
	return date.getHours();
};
exports.hour = hour;

var monthId = function(date) {
	return date.getMonth() + '-' + date.getFullYear();
};
exports.monthId = monthId;

var dateId = function(date) {
	return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
};
exports.dateId = dateId;

var addDay = function(date, days) {
	return new Date(date.getTime() + (days || 0)*24*60*60*1000);
};
exports.addDay = addDay;

var weekNumber = function (date, dowOffset) {
/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */
	dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
	var newYear = new Date(date.getFullYear(),0,1);
	var day = newYear.getDay() - dowOffset; //the day of week the year begins on
	day = (day >= 0 ? day : day + 7);
	var daynum = Math.floor((date.getTime() - newYear.getTime() - 
	(date.getTimezoneOffset()-newYear.getTimezoneOffset())*60000)/86400000) + 1;
	var weeknum;
	//if the year starts before the middle of a week
	if(day < 4) {
		weeknum = Math.floor((daynum+day-1)/7) + 1;
		if(weeknum > 52) {
			nYear = new Date(date.getFullYear() + 1,0,1);
			nday = nYear.getDay() - dowOffset;
			nday = nday >= 0 ? nday : nday + 7;
			/*if the next year starts before the middle of
 			  the week, it is week #1 of that year*/
			weeknum = nday < 4 ? 1 : 53;
		}
	}
	else {
		weeknum = Math.floor((daynum+day-1)/7);
	}
	return weeknum;
};
exports.weekNumber = weekNumber;

var weekId = function(date) {
	if(weekNumber(date) === 1) {
		for (var i = date.getDay(); i >= 0; i--) {
			date = addDay(date, -1);
		}
	}
	return weekNumber(date) + '-' + date.getFullYear();
};
exports.weekId = weekId;

var table = function(stop) {
	var date = new Date();
	var today = date;

	var rows = '';
	// add missing part of this week
	while(true) {
		if (date.getDay() === 0) break;
		date = addDay(date, 1);	
	}
	// rest
	while(true) {
		var row = [];
		var bail = false;

		for (var i = 0; i < 7; i++) {
			if (dateId(date) === stop) bail = true;

			var time = '';
			if (today == date) {
				time = 'today';
			}
			if (date > today) {
				time = 'future';
			}

			row.push(common.format("<div class='day {2}'><div class='dot {0}' id='{1}'><div class='num'></div></div></div>",time,dateId(date), i==6 ? 'first': ''));

			date = addDay(date, -1);
		}
		for (var i = row.length - 1; i >= 0; i--) {
			rows += row[i];	
		}
		rows += "<div class='clear'></div>";

		if(bail) break;
	}
	return rows;	
}
exports.table = table;
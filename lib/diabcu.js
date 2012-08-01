var _ = require('underscore');
var calendar = require('./calendar');

var parse = function(mail) {
	var readings = {};
	if (mail.Attachments && mail.Attachments[0].ContentType.toLowerCase() === 'text/csv') {
		var raw = new Buffer(mail.Attachments[0].Content, 'base64').toString('ascii').split('\n');
		var vals = [];
		var start = false;

		for(var i in raw) {
			var first = raw[i].substring(0,1);
			
			if(start) {
				vals.push(raw[i]);					
			}

			if(first === 'R') {
				start = true;
			} else if(start && first != '"') {
				break;
			}
		}

		readings.data = _.compact(vals.map(function(row){
			var cells = row.split(',');
			
			if(cells.length !== 5) {
				return;
			}

			var timestamp = new Date((cells[0] + ',' + cells[1] + ' GMT').replace(/"/g,''))
			return {
				bg: cells[2], 
				timestamp: timestamp,
				dayId: calendar.dateId(timestamp),
				weekId: calendar.weekId(timestamp),
				monthId: calendar.monthId(timestamp),
				hour: calendar.hour(timestamp)
			}
		}));

		readings.unit = readings.data[0].bg > 32 ? 'mgdl' : 'mmoll';
	}

	return readings;
};
exports.parse = parse;

var filter = function(readings, start, end) {
	var result = [];


	for(var i in readings.data) {
		var reading = readings.data[i];
		
		if(start && end) {
			if (new Date(reading.timestamp) > new Date(start) && new Date(reading.timestamp) < new Date(start)) {
				result.push(reading);
			}
			continue;
		}

		if(start) {
			if(new Date(reading.timestamp) > new Date(start)) {
				result.push(reading);
			}
			continue;		
		}
		
		if(end) {
			if(Date(reading.timestamp) < new Date(start)) {
				result.push(reading);
			}
			continue;
		}

		result.push(reading);
	}

	return result;
};
exports.filter = filter;


var group = function(readings, group) {
	switch(group) {
		case 'hour':
		return _.groupBy(readings, function(reading) {
			return reading.hour;
		});
		break;
		case 'day':
		return _.groupBy(readings, function(reading) {
			return reading.dayId;
		});
		break;
		case 'week':
		return _.groupBy(readings, function(reading) {
			return reading.weekId;
		});
		break;
		case 'month':
		return _.groupBy(readings, function(reading) {
			return reading.monthId;
		});
		break;
		default:
		return readings;
		break;
	}
};
exports.group = group;

var load = function(mail, options) {
	return group(filter(parse(mail),options.start,options.end),options.group);
}
exports.load = load;
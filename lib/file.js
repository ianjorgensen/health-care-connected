var common = require('common');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var less = require('less');

var pathify = function(str) {
	if (str.indexOf(',') === -1) {
		return [str];
	}

	var urls = str.split(',');
	var root = urls[0].substring(0,urls[0].lastIndexOf('/') + 1);
	var extension = urls[0].substring(urls[0].lastIndexOf('.'));
	var paths = [];

	common.loop(urls, function(i, url) {
		console.log(root, url, extension);
		var path = root + url + extension;

		if (!i) {
			path = url;
		}

		paths.push(path);
	});

	return paths;
};

var file = function(location, options) {
	options = options || {};
	options.status = options.status || 200;
	
	return function(request, response) {
		var url = common.format(location, request.params);

		var onnotfound = function() {
			response.writeHead(404);
			response.end();
		};

		var onerror = function(err) {
			response.writeHead(500);
			response.end(err);
		};

		var paths = pathify(url);
		var type = mime.lookup(paths[0]);

		if(type.indexOf('image/') != -1) {
			if (/\/\.\.\//.test(paths[0])) { // security check
				onnotfound();
				return;
			}

			fs.readFile(paths[0], function(err, data) {
		    response.writeHead(200, {"Content-Type": "image/png"});
		    response.write(data, "binary");
		    response.end();
			});
			return;
		}
		
		common.step([
			function(next) {
				for (var i = 0; i < paths.length; i++) {
					var path = paths[i];

					if (/\/\.\.\//.test(path)) { // security check
						onnotfound();
						return;
					}

					var text = '';

					fs.readFile(path,'ascii', next.parallel());
				}
			},
			function(data, next) {
				if (type === 'text/css') {
					for (var i = 0; i < data.length; i++) {
						try {
							less.render(data[i], function(err, css) {
								console.log('hi', err ? data[i] : css);
								next.parallel()(null, err ? data[i] : css);
							});
						} catch (e) {
							next.parallel()(null, data[i]);
						}
					}
				} else {
					next(null, data);
				}
			},
			function(data) {
				var output = '';

				for (var i = 0; i < data.length; i++) {
					output += data[i];
				}

				response.writeHead(200, {'content-type': type});
				response.end(output);
			}
				/*if (type === 'text/css') {
					try {
		   			less.render(data, function(err, css) {
							response.writeHead(200, {'content-type':'text/css'});
							response.end();
							text += err ? data : css;
						});
					} catch (e) {
						text += data;
					}
				} else {
					text += data;
				}
			}*/
		], onnotfound);
	};
};
exports.file = file;
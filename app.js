var express = require('express');
var path = require("path");
var fs = require("fs");
var mustache = require("mustache");
var uuid = require("node-uuid");
var underscore = require("underscore");

var app = express();


var data_option = process.argv[2]

console.log("Use data set : "+data_option);

var send_json_file = function( res, file, options ) {
	file = path.resolve(file);
	fs.readFile( file , "utf8" ,function( err, data) {
		if (err) {
			throw err;
		}
		data = mustache.render(data, options);
		res.setHeader('Content-Type', 'application/json;charset=UTF-8');
		res.setHeader('Cache-Control', 'no-store');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Content-Length', Buffer.byteLength(data, 'utf8'));
		console.log("Send: ",data);
		res.end(data,'utf8');
	});
}

var get_options = function(req) {
	return {
		request: req.body,
		fake_my_docs: function() {
			var diff = [];
			underscore.range(100).forEach( function() {
				diff.push({
					_id : uuid(),
					_rev: uuid()
				})
			});
			return diff;
		},
		fake_diff_result: function() {
			var diff = [];
			for ( k in req.body ) {
				diff.push({
					_id : k,
					_rev: "modified"
				})
			}
			return diff;
		},
		now: new Date().toISOString()
	};
}

app.use(express.bodyParser());


app.use(function(req, res, next){
	console.log('--------------------------');
	console.log('%s %s', req.method, req.url);
	console.log("Request: ", req.body);
	next();
});

app.get('/api/my_document_revs', function(req, res){
	var file = path.join("./","data",data_option,"my_document_revs.json");
	send_json_file(res, file, get_options(req));
});

app.post('/api/_diff', function(req, res){
	var file = path.join("./","data",data_option,"_diff.json");
	send_json_file(res, file, get_options(req));
});

app.post('/api/oauth2/access_token', function(req, res){
	var file = path.join("./","data",data_option,"access_token.json");
	send_json_file(res, file, get_options(req));
});

app.post('/api/_register_device', function(req, res){
	var file = path.join("./","data",data_option,"_register_device.json");
	send_json_file(res, file, get_options(req));
});

app.listen(3000);
console.log('Listening on port 3000');
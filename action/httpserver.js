var http = require("http"),
    sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    qs = require("querystring"),
    flickr = require('../3rdparty/flickr-fetch/flickr-fetch'),
    blendstore = require('../3rdparty/blend-store/blend-store'),
    blendImagesFeed = require('../3rdparty/blend-store/blend-images-feed'),
    stdout2json = require('../3rdparty/stdout-2-json/stdout-2-json'),
    forever = require('forever'),
    xml2js = require('xml2js'),
    static = require('node-static');

var urlMap = {
	
        'static': function (req, res) { 
		proxyNodeStatic(req,res);
  		}, 

        'channel': function (req, res) { 
		proxyNodeStatic(req,res);
  		}, 

        // remove
        'control': function (req, res) { 
		proxyNodeStaticForControl(req,res);
  		}, 

        // remove
        'channel-store': function (req, res) { 
		blendstore.proxyStore(req,res);
  		}, 
 
        //remove 
        'channel-store-images': function (req, res) { 
		blendImagesFeed.proxyStore(req,res);
  		}, 

        // remove
        'proxy': function (req, res) { 
		proxyDynamic(req,res);
  		}, 

        //remove
        'proxysave': function (req, res) { 
		proxySave(req,res);
  		}, 

        // remove
        /* We will need to work out this "grade" here so these 
           stores can be arguments.. */
    	'send_feed_item' : function (req, res, json) {
    		blendstore.appendInStore( "grade", json );
    		res.simpleJSON(200, {});
    	}

}

/* This is the main Web server broker handler 
   We check data that is sent against the urlMap and 
   then we go for possible actions.. 
*/

http.createServer(function (req, res) {

    sys.puts("From web" + req.url + " from " + req.connection.remoteAddress);

	var firstArgument = req.url.split('/')[1];
	var param = firstArgument;
	if(firstArgument.indexOf("?")>-1) { 
		param = firstArgument.split('?')[0];
	} 

	handler  = urlMap[param] || notFound;
	var json = "";
	if(req.method === "POST"){
		// this is async too 
		req.body = '';
		req.addListener('data', function (chunk) {
			// Build the body from the chunks sent in the post.
			req.body = req.body + chunk;
		}).addListener('end', function () {
			json = JSON.stringify(qs.parse(req.body));
			handler(req, res, json);
		});
	} else {
		// Here is where we use the results of urlMap as being 
  		// actions handlers...
		handler(req, res);
	}
	res.simpleJSON = function (code, obj) {
		var body = JSON.stringify(obj);
		res.writeHead(code, {
			"Content-Type": "text/json",
			"Content-Length": body.length
		});
		res.end(body);
	};

}).listen(8888);

var NOT_FOUND = "Not Found\n";

function notFound(req, res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write(NOT_FOUND);
  res.end();
}

/* Multi purpose static local web server 
   -- 
   This serves local pages 

  // Using CloudHead node static 
  // https://github.com/cloudhead/node-static
  //var file = new(static.Server)('.', { cache: 7200, headers: {'X-Hello':'World!'} });
*/

var serverPath = path.join( process.argv[2], process.argv[3] );
console.log("Starting local web server with path / "+ serverPath);
var file = new(static.Server)( serverPath, { cache: 00, headers: {'X-TelaSocial':'hi'} });

function proxyNodeStatic(request, response, dir) { 
    request.addListener('end', function () {
        file.serve(request, response, function (err, res) {
            if (err) { // An error as occured
                sys.error("> Error serving " + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end();
            } else { // The file was served successfully
                sys.puts("> " + request.url + " - " + res.message);
            }
        });
    }).resume();
} 

var fileControlServer = new(static.Server)(serverPath, { cache: 00, headers: {'X-TelaSocial':'control'} });

function proxyNodeStaticForControl(request, response, dir) { 
    request.addListener('end', function () {
        fileControlServer.serve(request, response, function (err, res) {
            if (err) { // An error as occured
                sys.error("> Error serving " + request.url + " - " + err.message);
                response.writeHead(err.status, err.headers);
                response.end();
            } else { // The file was served successfully
                sys.puts("> " + request.url + " - " + res.message);
            }
        });
    }).resume();
} 

console.log('Server running at http://127.0.0.1:8888/');


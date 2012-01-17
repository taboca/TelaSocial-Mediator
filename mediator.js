/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is TelaSocial
 *
 * The Initial Developer of the Original Code is Taboca TelaSocial.
 * Portions created by the Initial Developer are Copyright (C) 2010 
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Marcio Galli   <mgalli@taboca.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/* Mediator 0.2 - work in progress */

var http = require("http"),
    sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    qs = require("querystring"),
    flickr = require('./3rdparty/flickr-fetch/flickr-fetch'),
    blendstore = require('./3rdparty/blend-store/blend-store'),
    stdout2json = require('./3rdparty/stdout-2-json/stdout-2-json'),
    forever = require('forever'),
    xml2js = require('xml2js'),
    static = require('./3rdparty/server-static/lib/node-static');


var localRules = new Array(); // Old model we had local rules and these were not 
                              // an event in the system. These were more like 
                              // globals. This is 0.1 

var eventQueue = new Array(); // This is 0.2 approach. We can also queue 
                              // events. Each event has a rule for processing etc

var urlMap = {
	
        'static': function (req, res) { 
		proxyNodeStatic(req,res);
		//proxyStatic(req,res);
  		}, 
	
        'control': function (req, res) { 
		proxyNodeStaticForControl(req,res);
		//proxyStatic(req,res);
  		}, 

        'channel': function (req, res) { 
		proxyNodeStatic(req,res);
  		}, 

        'channel-store': function (req, res) { 
		blendstore.proxyStore(req,res);
  		}, 

        'proxy': function (req, res) { 
		proxyDynamic(req,res);
  		}, 

        'proxysave': function (req, res) { 
		proxySave(req,res);
  		}, 

        /* We will need to work out this "grade" here so these 
           stores can be arguments.. */
	'send_store_item' : function (req, res, json) {
		blendstore.appendInStore( "grade", json );
		res.simpleJSON(200, {});
	}

}

/* This is the main Web server broker handler 
   We check data that is sent against the urlMap and 
   then we go for possible actions.. 
*/

http.createServer(function (req, res) {
	// Try to find the handler or trigger a 404
        sys.puts("argument from ajax " + req.url);
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
	}else{
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

}).listen(80);

/* application setup */ 
setupApp(); 

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
var file = new(static.Server)('.', { cache: 00, headers: {'X-TelaSocial':'hi'} });

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
    });
} 

var fileControlServer = new(static.Server)('.', { cache: 7200, headers: {'X-TelaSocial':'control'} });

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
    });
} 



/* Run engine 0.1
 
   The version 0.1 Run Engine is basically a loop, every 5 seconds, through all 
   the items in the localRules. We check their execution state, so if a rule is 
   not being executed, then we kick the executio of that rule. 

   0.2 Architecture is a queue ( perhaps of stacks ) 
   
    + each event in the queue { 

	+ uuid
  	+ script function 
 	+ arguments 
	+ success
	+ error 

  Example of chained events

  LoadRSS 
	url 
	ok:channel,timerCicle
	err:loadRSSAlt, timerCicle

   timerCicle 
 	30s
	ok: loadRSS

   fetchFlickr 
	url
	ok:fetchImages
	err: timerCicleflickr 

   fetchImages 
 	channel.fetchFLickr.url	
	channel.store.flickr
	ok: resizeImage
	err: pass
	
*/


function run() { 
    for(k in eventQueue) { 
	var currentEvent = eventQueue[k];
        sys.puts('Checking event:' + currentEvent.uuid);
        if(currentEvent.executionContext == 0) { 
          var kk = k;
          currentEvent.executionContext = 1;
          //sys.puts("  -> Setting timer : " + currentRule.timer + " for " + kk);
          executeProcessRule(currentEvent.uuid);
        } 
    } 
/*
    setTimeout(function () { 
        run();
    },5000); 
*/
} 


/* Forever 
   https://github.com/indexzero/forever
*/

function executeProcessRule(uuid) { 
	var curr = eventQueue[uuid];
	curr.executionContext = 0;
	sys.puts("Rule processing..." + uuid);

	if(curr.script.function == "saveRSS") { 
	    script = path.join(__dirname, 'action/loadRSS.js');
            var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.channel,  curr.script.url  ]  });
            curr.processHandler = child1;
	    child1.on('exit', function () { } );
	    child1.on('stdout', function (data) { 
		executeProcessFlow(uuid, data.toString());	
            });
	    child1.on('stderr', function (data) { 
		executeProcessFlow(uuid, data.toString());	
            });
            child1.start();
            sys.puts('Forever process spawn');
	} 

/* 
This ImageFetchAndResize is a chained event. So it first will 
go after the flickr RSS Feed to fetch the data, similarly to the above
the saveRSS. Then, and only then, when the data arrives, it will 
initiate fetching all the images, so it's an async process going 
on here. Then, and only then, when the images are loaded, it will 
resize all them and then it will properly be able to serve 
the local feed with the new images Paths ( to this localhost 
to the appropriate channel ). 
*/
	if (curr.script.function == 'ImageFetchAndResizeImagesFromRSS') { 
	    script = path.join(__dirname, 'action/loadRSS.js');
            var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.channel,  curr.script.url  ]  });
            child1.start();
	    child1.on('exit', function () { sys.puts('....exited...')} );
	    child1.on('stdout', function (data) { 
		var data = stdout2json.get(data);
                try { 
                  if(data.result=="ok") { 

                    /* this is interesting case, a bit hybrid architecture here. 
                       we are simply calling the flickr flickrEvent app 
                       instead using a local event queue. This is a bit conflicting 
                       with the idea of a pipeline with events.. */

                    var a = new flickr.flickrEvent();
                    a.init(curr.script.channel);
                  } 
                } catch(i) { 
                        sys.puts('.'); 
                }
            });
	} 
} 

/* This function will parse the stdout of separated process 
   and will check if there is a follow up operation to do. 
   It turns out we have cases where the above function processRules

*/
function executeProcessFlow(uuid, strData) { 
sys.puts("1");
   var payload = stdout2json.get(strData);
    if(payload.result == 'ok') { 
     sys.puts('Removing ' + uuid + " from queue.. " );
     eventQueue[uuid].pop();
   } 
   if(payload.result == 'expired') { 
     sys.puts('Expired event for uuid = ' + uuid + ' and trying to kill process ' );
     if(eventQueue[uuid].executionContext==1) { 
        eventQueue[uuid].processHandler.stop();
        eventQueue[uuid].pop();
     } 
   } 
  // we do something against the uuid next linked event..
} 

function setupApp() { 
  var filename = 'script.json';
  if(process.argv[2]) { 
      filename = process.argv[2];
  } 
	fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
		sys.puts('Error:configScript:' + err);
                return;  
            }  
            data = JSON.parse(file); 
	    var listJSONRules = data.rules;
 	    for(k in listJSONRules) { 
		var currentEvent = new eventRuleObject(); 
                currentEvent.script = listJSONRules[k];
		// 0.1 localRules[currentRule.channel] = currentRule;
		eventQueue[currentEvent.uuid] = currentEvent; 
	        sys.puts('Inserting event..' + currentEvent.uuid);
	    } 
            // Now that we have all the basic rules inserted as events, 
            // we kick start things..
            run(); 
        });
} 

/* This is 0.2 architecture, 
   where a rule is an event */

function eventRuleObject() { 
    this.uuid = null; 
    this.name = null; 
    this.script = null;  // this is the payload - it's associated with the 
                         // script.json - rules file. 
    this.uuid = Math.random();
    this.executionContext = 0; 
    this.processHandler = null; 
} 

console.log('Server running at http://127.0.0.1:80/');


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

var http = require("http"),
    sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    qs = require("querystring"),
    rss = require('./3rdparty/node-rss/node-rss'),
    realtime = require('./3rdparty/realtime/realtime'),
    store = require('./3rdparty/realtime/load_channel_store'),
    forever = require('forever'),
    static = require('./3rdparty/server-static/lib/node-static');


var localRules = new Array(); // Old model we had local rules and these were not 
                              // an event in the system. These were more like 
                              // globals. This is 0.1 

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
		proxyStore(req,res);
  		}, 

        'proxy': function (req, res) { 
		proxyDynamic(req,res);
  		}, 

        'proxysave': function (req, res) { 
		proxySave(req,res);
  		}, 

	'real_time_feed' : function (req, res) {
			var since = parseInt(qs.parse(url.parse(req.url).query).since, 10);
			realtime.feed.query(since, function (data) {
				res.simpleJSON(200, data);
			});
		},
	'send_feed_item' : function (req, res, json) {
			realtime.feed.appendInStore( "grade", json );
			//realtime.feed.appendMessage( json );
			res.simpleJSON(200, {});
		},
	'send_feed_item_minicursos' : function (req, res, json) {
			realtime.feed.appendInStore( "minicursos", json );
			//realtime.feed.appendMessage( json );
			res.simpleJSON(200, {});
		},
	'send_store_item' : function (req, res, json) {
			realtime.feed.appendInStore( "grade", json );
			//realtime.feed.appendMessage( json );
			res.simpleJSON(200, {});
		}

}

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

// Using CloudHead node static 
// https://github.com/cloudhead/node-static

//var file = new(static.Server)('.', { cache: 7200, headers: {'X-Hello':'World!'} });

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

var proxyStoreResponseHolder = null; 

function proxyStore(req, res) { 
  var firstArgument = req.url.split('/')[2];
  var param = firstArgument;
  if(firstArgument.indexOf("?")>-1) { 
    param = firstArgument.split('?')[0];
  } 
  var strBuffer ="";
  store.mergeAndSave(param, function (files) { 
    //res.writeHead(200, {'Content-Type': 'text/json'});
    for(k in files) { 
      sys.puts("List item:" + files[k]);
      var buffer = '{"data":[';
      var missing = files.length;
      var file = null;
      while(file = files.pop()) { 
	sys.puts("file tryin to open " + 'channel/store/'+param+'/'+file); 
	fs.readFile('channel/store/'+param+'/'+file, "UTF-8", function(err, filecontent) {  
          if(err) {  
              sys.puts('Error:configLoad:' + err);
            return;  
          }  
          missing--;
	  var sep = '';
          if(missing>0) { 
            sep = ',';	
	  } 
          buffer += filecontent + sep;
	  sys.puts("Serving file: " + missing);
          if(missing==0) { 
	    buffer += ']}';
            
            var obj = JSON.parse(buffer);
            var body = JSON.stringify(obj);
	    sys.puts("222222222222" + body);
	    //var body = buffer;
            // res.setEncoding('utf8'); 
            // "Content-Length": body.length // trouble with utf-8
            res.writeHead(200, {
                  "Content-Type": "text/json"
            });
            res.end(body);
            //res.end(buffer);
            //res.write(buffer);
            //res.end();
          } 
	});
      } 
    } 	
  });
} 

function proxyDynamic(req,res) { 
	var feed_url = 'http://rss.terra.com.br/0,,EI12940,00.xml';

	var buffer = "";
	var response = rss.parseURL(feed_url, function(itemArticle) {
	    sys.puts(itemArticle.length);
	    for(i=0; i<itemArticle.length; i++) {
	   
	        buffer+="Article: "+i+", "+
	                 itemArticle[i].title+"\n"+
	                 itemArticle[i].link+"\n"+
	                 itemArticle[i].description+"\n"+
	                 itemArticle[i].content;
	                
	    }
	  res.writeHead(200, {'Content-Type': 'text/plain'});
	  res.write("1"+buffer);
	  res.end();
	});
}

function proxySave(req,res) { 
	options = {
	    host: 'www.google.com'
	  , port: 80
	  , path: '/images/logos/ps_logo2.png'
	}
	var feed_url = 'http://www.latinoware.org/en/rss.xml';
	var buffer = "";
	var response = rss.parseURL(feed_url, function(itemArticle) {
	    sys.puts(itemArticle.length);
	    for(i=0; i<itemArticle.length; i++) {
	        buffer+="Article: "+i+", "+
	                 itemArticle[i].title+"\n"+
	                 itemArticle[i].link+"\n"+
	                 itemArticle[i].description+"\n"+
	                 itemArticle[i].content;
	    }
        fs.writeFile('channel/terra.xml', buffer, 'binary', function(err){
            if (err) throw err
            console.log('File saved.')
        })
	});
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.write('saved');
	res.end();
} 

function setupApp()  { 
	configLoad();
	run(); 
} 

/* Run engine 0.1
 
   The version 0.1 Run Engine is basically a loop, every 5 seconds, through all 
   the items in the localRules. We check their execution state, so if a rule is 
   not being executed, then we kick the executio of that rule. 

*/
function run() { 
    for(k in localRules) { 
	var currentRule = localRules[k];
        sys.puts('Checking rule..' + k);
	if(currentRule.executionContext == 0) { 
		var kk = k;
		currentRule.executionContext = 1;
		sys.puts("  -> Setting timer : " + currentRule.timer + " for " + kk);
		setTimeout(executeProcessRule, parseInt(currentRule.timer), kk );
	} 
    } 
    setTimeout(function () { 
        run();
    },5000); 
} 


/* Forever 
   https://github.com/indexzero/forever
*/

function executeProcessRule(strKey) { 
	var curr = localRules[strKey];
	curr.executionContext = 0;
	sys.puts("Rule processing..." + strKey);

	if(curr.function == "saveRSS") { 
	    //https://github.com/indexzero/forever#readme
	    script = path.join(__dirname, 'action_loadRSS.js');
            // Note that forever monitor should be used for NodeJS scripts only 
            var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.channel,  curr.url  ]  });
            child1.start();

            // events...https://github.com/nodejitsu/forever
	    child1.on('exit', function () { } );
	    child1.on('stdout', function (data) { 
                sys.puts('...from saveRSS = { ' + data + ' } ' )
		executeProcessCallback(data.toString());	
            });
            sys.puts('Forever process spawn');
//		ruleLoadSaveRSS(curr.channel, curr.url);
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
	if (curr.function == 'ImageFetchAndResizeImagesFromRSS') { 

	} 
} 

/* This function will parse the stdout of separated process 
   and will check if there is a follow up operation to do. 
   It turns out we have cases where the above function processRules

*/
function executeProcessCallback(strData) { 

	var probe = strData.split("==");
	if(probe.length>1) { 
	
            data = JSON.parse(probe[1]);

	    sys.puts("Testing output of stdout callback = " + data.result);
	
	} 

} 

// if the channel is not available we need to make a decision
function ruleLoadSaveRSS(name, href) { 
	/*
	var feed_url = 'http://www.latinoware.org/en/rss.xml';
	var feed_url = url;
	*/
	var buffer = "";

	var host = url.parse(href).host;
	var path = url.parse(href).path;

        var options = {
            host: host,
            port: 80,
            path: path
        };

        var request = http.get(options);

        request.on('response', function (res) {
            res.on('data', function (buffer) {
       	       fs.writeFile('channel/'+name+'.xml', buffer, 'utf8', function(err){
       	        if (err) throw err
       	        console.log('File saved.')
               });
           });
        })


/*
	var response = rss.parseURL(feed_url, function(itemArticle) {
	    sys.puts(itemArticle.length);
		// This is a hack — we keep an RSS but we will need a lot of 
		// code here to allow mediation with filter ie pipe style 
		// chain of events? 
		buffer += '<?xml version="1.0" encoding="utf-8"?><rss version="2.0"  xmlns:dc="http://purl.org/dc/elements/1.1/"> <channel><title>proxy social</title>';
	    for(i=0; i<itemArticle.length; i++) {
		buffer+='<item><title>'+itemArticle[i].title+'</title>';
		buffer+='<link>'+itemArticle[i].link+'</link>';
		buffer+='<description>'+itemArticle[i].description+'</description>';
		buffer+='<pubDate>'+itemArticle[i].pubDate+'</pubDate></item>';
	        //buffer+="Article: "+i+", "+ itemArticle[i].title+"\n"+ itemArticle[i].link+"\n"+ itemArticle[i].description+"\n"+ itemArticle[i].content; 
	    }
	    buffer+= '</channel></rss>';
       	    fs.writeFile('channel/'+name+'.xml', buffer, 'utf8', function(err){
       	        if (err) throw err
       	        console.log('File saved.')
            })
	});
*/

} 


/* 

 This is a bit of spec towards 0.2 Mediator 
 eventRule { 
    uniqueID 
    function 
    executionContext
    generatorCallback { 
      success:  
      failure:
    }  
 } 
*/

function configLoad() { 
	var filename = 'config.json';
	fs.readFile(filename, "binary", function(err, file) {  
            if(err) {  
		sys.puts('Error:configLoad:' + err);
                return;  
            }  
            data = JSON.parse(file); 
	    var listJSONRules = data.rules;
 	    for(k in listJSONRules) { 
		var currentRule = listJSONRules[k];
		// This can be tricky. In our model we have a strict set of 
		// rules, so it's not a per uniqueID set of rules. We may, 
		// in the future, consider to have rules to work more like 		
		// messages as well. So, then, when the config script is read
		// we populate the rules message queue. And if there is a new
		// cycling rule ( from time to time ) we simply add again and 
		// again to this queue based in the execution state. So a real
		// linear model. Right now it's like our rules are global objects
		currentRule.executionContext = 0;
		localRules[currentRule.channel] = currentRule;
	        sys.puts('Loading rule..' + currentRule.channel);
	    } 
        });
} 

console.log('Server running at http://127.0.0.1:80/');


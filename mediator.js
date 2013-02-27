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

/* Mediator 0.3 - work in progress */

var http = require("http"),
    sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    qs = require("querystring"),
    flickr = require('./3rdparty/flickr-fetch/flickr-fetch'),
    blendstore = require('./3rdparty/blend-store/blend-store'),
    blendImagesFeed = require('./3rdparty/blend-store/blend-images-feed'),
    stdout2json = require('./3rdparty/stdout-2-json/stdout-2-json'),
    forever = require('forever'),
    xml2js = require('xml2js'),
    static = require('./3rdparty/server-static/lib/node-static');


var localRules = new Array(); // Old model we had local rules and these were not 
                              // an event in the system. These were more like 
                              // globals. This is 0.1 

var gLocalAppDir = 'app_default';

var eventQueue = new Array(); 

function eventRuleObject() { 
    this.uuid = null; 
    this.name = null; 
    this.script = null;  // this is the payload - it's associated with the 
                         // script.json - rules file. 
    this.uuid = Math.random();
    this.executionContext = 0; 
    this.processHandler = null; 
} 

/* application setup */ 
setupApp(); 

function run() { 
    for(var k in eventQueue) { 
       var currentEvent = eventQueue[k];
       if(typeof currentEvent != 'undefined') { 
            sys.puts('Checking event:' + currentEvent.uuid);
            if(currentEvent.executionContext == 0) { 
               var kk = k;
               currentEvent.executionContext = 1;
                //sys.puts("  -> Setting timer : " + currentRule.timer + " for " + kk);
               executeProcessRule(currentEvent.uuid);
            } 
       } else { 
          sys.puts("Ignoring event: " + k);
       } 
    } 
} 

/* Forever 
   https://github.com/indexzero/forever
*/
function executeProcessRule(uuid) { 
	var curr = eventQueue[uuid];
	sys.puts("Rule processing..." + uuid);

	if(curr.script.function == "timer") { 
       setTimeout(function () { 
         execFlow(uuid, '=>{"result":"ok"}<=');
       },parseInt(curr.script.data.value)); 
	} 

    if(curr.script.function == "script") { 
       execFlow(uuid, '=>{"result":"ok"}<=');
       loadScript(curr.script.data.value, curr.script.about);
    } 

    if(curr.script.function == "httpserver") { 
	    script = path.join(__dirname, 'action/httpserver.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [  __dirname, gLocalAppDir ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
        flog(uuid, ' initiated process...'+child1);
	} 

    if(curr.script.function == "daemon-ftp") { 
	    script = path.join(__dirname, 'action/ftpserver.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.about,  curr.script.data.value  ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
        sys.puts('Forever process spawn');
	} 

	if(curr.script.function == "loadTXT") { 
	    script = path.join(__dirname, 'action/loadTXT.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.about,  curr.script.data.value  ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
        sys.puts('Forever process spawn');
    } 

	if(curr.script.function == "spawnJS") { 
	    script = path.join(__dirname, 'action/'+curr.script.data.value);
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.about ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
        sys.puts('Forever process spawn');
	} 

	if(curr.script.function == "saveRSS") { 
	    script = path.join(__dirname, 'action/loadRSS.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.about,  curr.script.data.value , gLocalAppDir ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
        sys.puts('Forever process spawn');
	} 

	// we might need execFlow to check other cases other than the normal pass 'ok'

	if(curr.script.function == "execCommandStoreOut") { 
	    script = path.join(__dirname, 'action/execCommandPing.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.argument, gLocalAppDir ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
        sys.puts('Forever process spawn');
	} 

	if(curr.script.function == "execCommand") { 
	    script = path.join(__dirname, 'action/execCommand.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.argument, gLocalAppDir ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
        sys.puts('Forever process spawn');
	} 

	if (curr.script.function == 'getImageNoCache') { 
	    script = path.join(__dirname, 'action/fetch-save-image-nocache.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.about,  curr.script.data.value  ]  });
        curr.processHandler = child1;
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
	} 

	if (curr.script.function == 'fetchTEDPages') { 
	    script = path.join(__dirname, 'action/fetch-ted-pages.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.about,  curr.script.data.value  ]  });
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
	} 

	if (curr.script.function == 'fetchFlickrImages') { 
	    script = path.join(__dirname, 'action/fetch-flickr-images.js');
        var child1 = new (forever.Monitor)(script,  { max: 1, options: [ curr.script.data.about,  curr.script.data.value  ]  });
        child1.start();
	    child1.on('exit', function () { flog(uuid, ' script exited...')} );
	    child1.on('stdout', function (data) { execFlow(uuid, data);	});
	    child1.on('stderr', function (data) { execFlow(uuid, data);	});
	} 
} 

/* This function will parse the stdout of separated process 
   and will check if there is a follow up operation to do. 
   It turns out we have cases where the above function processRules
*/

function flog(uuid, str) { 	
   console.log('eventUpdate: '+uuid+': '+str);	
} 

function store(str) { 	
   console.log('eventToStore:' +str);	
} 


function execFlow(uuid, streamStdout) { 

  var list = stdout2json.get(streamStdout);

  for(var key in list.flow) { 

    var payload = list.flow[key];

    if(payload.result == 'note') { 
      flog(uuid, 'result=note;' + payload.data );
      //eventQueue[uuid] = null;
    } 

    if(payload.result == 'ok') { 
      var toEvent = null; 
      if(typeof eventQueue[uuid].script.to != 'undefined') { 
        toEvent = eventQueue[uuid].script.to; 
      } 
      eventQueue[uuid] = null;
      delete eventQueue[uuid];
      flog(uuid, 'result=ok; removing ' + uuid + ' from queue.. ' );
      if(toEvent != null) { 
	  createEvent(toEvent);
      } 
    } 

    // We are testing the concept of pass... 

    if(payload.result == 'pass') { 
      flog(uuid, 'result=pass; removing ' + uuid + ' from queue.. ' );
      var toEvent = eventQueue[uuid].script.to; 
      //eventQueue.splice(uuid,1);
      eventQueue[uuid] = null;
      delete eventQueue[uuid];
      createEvent(toEvent);
    } 

    if(payload.result == 'error') { 
      // likewise to error, so far for 
      flog(uuid, 'result=error;'+ payload.data +' and removing it from queue.. ' );
      var toEvent = null; 
      if(payload.type == 'offline') { 
         if(typeof eventQueue[uuid].script.to != 'undefined') { 
            toEvent = eventQueue[uuid].script.to; 
         } 
      } 

      if(eventQueue[uuid]) { 
        flog(uuid,'execContext = ' + eventQueue[uuid].executionContext);
        if(eventQueue[uuid].executionContext==1) { 
           eventQueue[uuid].processHandler.stop();
        } 
      }

      eventQueue[uuid] = null;
      delete eventQueue[uuid];
      // if an error can lead to try again
      if(toEvent != null) { 
        createEvent(toEvent);
      } 
    } 

    if(payload.result == 'expired') { 
      // We are forcing now process kill and we try again... 
      flog(uuid,'result=expired; will kill process... ' );
      var toEvent = null; 
      if(typeof eventQueue[uuid].script.to != 'undefined') { 
         toEvent = eventQueue[uuid].script.to; 
      } 
      if(eventQueue[uuid]) { 
        flog(uuid,'execContext = ' + eventQueue[uuid].executionContext);
        if(eventQueue[uuid].executionContext==1) { 
           eventQueue[uuid].processHandler.stop();
        } 
      }
      eventQueue[uuid] = null;
      delete eventQueue[uuid];
      if(toEvent != null) { createEvent(toEvent); } 
    } 

  }
} 

/* We create an event from the localEvents by name */

function createEvent(namedEvent) { 
	var scriptToEvent = localRules[namedEvent];
	var currentEvent = new eventRuleObject(); 
        currentEvent.script = scriptToEvent;
        sys.puts('Inserting event..' + currentEvent.uuid);
	eventQueue[currentEvent.uuid] = currentEvent; 
	run();
} 

var flogArchive = false;

function setupApp() { 
    var filename = 'script.json';
    if(process.argv[2]) { 
        gLocalAppDir = process.argv[2];
        serverPath = path.join(__dirname, gLocalAppDir);
    }
    if(process.argv[3]) { 
        filename = process.argv[3];
    } 
    loadScript(filename,"init");
} 

function loadScript(filename, namespace) { 
    var configScript = path.join(serverPath, filename);
    fs.readFile( configScript, "binary", function(err, file) {  
        if(err) {  
            sys.puts('Error:configScript:' + err);
            return;  
        }  
        data = JSON.parse(file); 
        var listJSONRules = data.rules;
        for(k in listJSONRules) { 
            var currScript = listJSONRules[k];
            var stateAbout = currScript.about;
            var stateTo = currScript.to;
            currScript.about = namespace +"/"+ stateAbout;

            if(typeof currScript.to != 'undefined') { 
                currScript.to = namespace +"/"+ stateTo;
            } 
               
            if(currScript.about == namespace + '/start') { 
                var currentEvent = new eventRuleObject(); 
                currentEvent.script = currScript;
                eventQueue[currentEvent.uuid] = currentEvent; 
                sys.puts('Inserting event..' + currentEvent.uuid);
                run(); 
            }  
            localRules[currScript.about] = currScript;
        } 
    });
} 

console.log('Server running at http://127.0.0.1:8888/');


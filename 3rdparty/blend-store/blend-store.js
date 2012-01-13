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

var sys = require("sys"),
    fs = require("fs")
    store = require('../realtime/load_channel_store');


/* The proxy store is our collection of items that 
   we created based in a calendar use case. This loads a lot of 
   snippets of JSON from a given directory, and merges them 
   in a big compound JSON file. 
*/

this.proxyStoreResponseHolder = null; 

// this is so far global...

this.proxyStore = function (req, res) { 
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

this.appendInStore = function (store,json) {
    script = path.join(__dirname, 'save_channel_store.js');
    sys.puts("Will exec "+ script + " with arguments " + store + " and " + replacestr(json) );
    // http://www.sitepoint.com/whats-the-best-date-format/
    var filenameStamp = JSON.stringify({ date: new Date() });
    sys.puts("fileName to write :" + filenameStamp); 
    var child1 = new (forever.Monitor)(script,  { max: 1, options: [ store, replacestr(json) , filenameStamp ]  });
    child1.start();
}

function replacestr(cmd) {
  return cmd;
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
  //return Buffer(cmd).toString('base64')
};


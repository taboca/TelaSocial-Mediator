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
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    request = require("request"),
    forever = require('forever'),
    out = require('../3rdparty/stdout-2-json/stdout-2-json'),
    xml2js = require('xml2js');
 
function parseAndSave() { 

   this.listPages= new Array();
   this.downloadedItems = new Array();

   this.channel = null; 
   this.sendToApp = null;
   this.targetStore = null; 
   this.hasEnded = null;

   this.init = function (targetStore, sourceChannel, appPath, sendingDataFunction, hasEndedFunction) { 

    	this.targetStore = targetStore;
      this.channel = sourceChannel; 

    	this.sendToApp = sendingDataFunction;
    	this.hasEnded  = hasEndedFunction;
      this.appPath = appPath; 
      this.channelData = null;

     // console.log(1);

      this.sendToApp("Parsing the Atom for channel " + sourceChannel);	

    	var parser = new xml2js.Parser({'mergeAttrs':true});
    	var that=this;

    	parser.addListener('end', function(result) {
    		//console.log("======" + JSON.stringify(result));
    		for(var i=0;i<result.feed.item.length;i++) { 
          var uid = Math.random();
          var linkHTML = result.feed['xml:base']+result.feed.item[i].img[0].src;
          result.feed.item[i].img[0].src=uid;
          that.listPages.push({"download":linkHTML,"uid":uid, "test":false});
    		} 
        that.channelData = JSON.stringify(result);
    		that.renderFetch(); 
    	});

      var filePath = pathFS.join( __dirname, '..', this.appPath, 'channel', sourceChannel +'.xml');
      
     // console.log("===>" + filePath);

    	fs.readFile(filePath, function(err, data) {
    		parser.parseString(data);
    	});
   } 

   this.renderFetch = function () { 
    var curr = this.listPages.pop();
    if(curr) { 

      this.sendToApp("will pass " + this.channel + " and current link = " + curr.download);
      this.fechObject(this.targetStore, curr);
    } else { 
      this.hasEnded(this.downloadedItems, this.channelData);
    } 	
   } 

   this.fechObject = function (channel, objToFetch) { 
        var href = url.parse(objToFetch.download).href;
        var filedate= JSON.stringify({ date: new Date() });
        var filename = JSON.parse(filedate).date;
        var that = this; 
        var filePath = pathFS.join( __dirname, '..', that.appPath, 'channel', channel, objToFetch.uid+'.jpg');
        var file = fs.createWriteStream(filePath);
        file.on('close',function () { 
            console.log('==ok==, file saved');
            objToFetch.test=true;
            that.downloadedItems.push(objToFetch);
            setTimeout(function () { that.renderFetch() },1000);
         //   file.close();
        });
        file.on('error', function (err) {
            console.log('===error====')
        });
        request(href, function fDone(error, response, body) { 
             // console.log(response)
        }).pipe(file);
    }
} 

function startApp(about, source, appPath) {
    out.send({'result':'note','data':'init fetch...'});
    var a = new parseAndSave();
    a.init(about, source, appPath, function (str) {
       out.send({'result':'note','data':str } );
    }, function (elements, dataStringOfJSON) { 

      // This is sucess, we think so 
       for(var k in elements) {
          var el = elements[k];
          //console.log(el.uid + ' test = ' + el.test);
       }


       var filePath = pathFS.join( __dirname, '..', appPath, 'channel', about+'.txt');
       fs.writeFile(filePath, dataStringOfJSON, 'utf-8', function(err){
           if (err) { 
             out.senderr({'result':'error', 'payload': err});
             throw err; 
           }   
           clearTimeout(timer);
           out.send({'result':'ok'});
        });

    })
}

/* Remember to clear the timeouts */
timer = setTimeout(function () { out.send({'result':'expired'}) },45000); 
startApp(process.argv[2], process.argv[3] ,process.argv[4]);


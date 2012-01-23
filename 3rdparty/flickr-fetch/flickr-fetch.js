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
    forever = require('forever'),
    xml2js = require('xml2js');

this.flickrEvent = function () { 

   this.listImages= new Array();
   this.channel = null; 
   this.sendToApp = null;
   this.targetStore = null; 
   this.hasEnded = null;

   this.init = function (sourceChannel, targetStore, sendingDataFunction, hasEndedFunction) { 
	this.channel = sourceChannel; 
	this.targetStore = targetStore;

	this.sendToApp = sendingDataFunction;
	this.hasEnded  = hasEndedFunction;

        this.sendToApp("Parsing the RSS for channel " + sourceChannel);	
	var parser = new xml2js.Parser({'mergeAttrs':true});
	var that=this;
	parser.addListener('end', function(result) {
          // Use this to inspect everything JSON from this XML 
          //console.log(sys.inspect(result, false, null))
		for(var i=0;i<result.entry.length;i++) { 
          		var linkImage = result.entry[i].link[1].href;
			that.listImages.push(linkImage);
		} 
		that.renderFetch(); 
	});
	fs.readFile('./channel/'+sourceChannel+'.xml', function(err, data) {
		parser.parseString(data);
	});
   } 

   this.renderFetch = function () { 
	var curr = this.listImages.pop();
        if(curr) { 
		this.sendToApp("will pass " + this.channel + " and curr image = " + curr);
		this.fetchImage(this.targetStore, curr);
		this.renderFetch();
	} else { 
		this.hasEnded();
	} 	
   } 

   this.fetchImage = function (channel, url) { 
	    var script = path.join(__dirname, 'fetch-save-image.js');
            var child1 = new (forever.Monitor)(script,  { max: 1, options: [ url, channel] });
            child1.start();
	    child1.on('exit', function () { sys.puts('  ...flickr-fetch  .. Exited')} );
	    child1.on('stdout', function (data) { 
		sys.puts(' I think I saved .. ' ) ;
		/*
		var data = commonJSfromStdOut(data.toString());
		try { 
			if(data.result=="ok") { 
			} 
		} catch(i) { 
			sys.puts('not processed'); 
		}
		*/
            });
    } 
	
} 


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
    http = require("http"),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');

function getAndSaveImage(name, href, appPath) {

	var host = url.parse(href).host;
	var path = url.parse(href).pathname;
	var port = url.parse(href).port;
	var search ='';
	var searchProbe = url.parse(href).search;
	if(typeof searchProbe != 'undefined') {
      if(searchProbe) {
          search=searchProbe;
      }
	}

   host=host.split(':')[0];
   out.send({ 'path + search':host});
    var options = {
       host: host,
       port: port,
       path: path+search
   };

    var request = http.get(options);
    request.on('error', function (e) {
        out.senderr({'result':'error','type':'offline','data':e} );
    });
    out.send({'result':'note','data':'init fetch: '+host+path});
    request.on('response', function (res) {
       var bufferedData = "";
       res.setEncoding('binary');
       res.on('data', function (dataBuffer) {
          bufferedData+=dataBuffer;
       });
       res.on('end', function () {
          var filePath = pathFS.join( __dirname, '..', appPath, 'static', name);

          fs.writeFile(filePath, bufferedData, 'binary', function(err){
            if (err) {
              out.senderr({'result':'error','data':err} );
              throw err;
            }
            clearTimeout(timer);
            out.send({'result':'note','data':'file saved: ./channel/'+name});
            out.send({'result':'ok'});
          });
       });
    });
}

/* Remember to clear the timeouts */
timer = setTimeout(function () { out.send({'result':'expired'}) },30000);
getAndSaveImage(process.argv[2], process.argv[3], process.argv[4]);

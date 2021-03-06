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
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http");
 
function getAndSaveImage(href, name) {

	var host = url.parse(href).host;
	var path = url.parse(href).pathname;
        var options = {
            host: host,
            port: 80,
            path: path
        };
        var request = http.get(options);

        sys.puts('trying to fetch ' + host + ' and ' + path);
        request.on('response', function (res) {
           var bufferedData = "";
           res.setEncoding('binary');
           res.on('data', function (dataBuffer) {
		bufferedData+=dataBuffer;	
               });
           res.on('end', function () {
                var filedate= JSON.stringify({ date: new Date() });
	        var filename = JSON.parse(filedate).date;
                fs.writeFile('channel/'+name+'/image-'+filename+'.jpg', bufferedData, 'binary', function(err){
                  if (err) { 
                    throw err;
                  }
                  console.log('file saved');
                });
           });
       });
}

/*
sys.puts("This expects a local directory, created, named ./store ");
sys.puts("Pass HTTP URL to image ( http://site.com/image.png ) and data store dir ");
sys.puts("Trying to open "+ process.argv[2] + " and to save to " + process.argv[3] );
*/

getAndSaveImage(process.argv[2], process.argv[3]);





/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 
  
 * Contributor: Marcio Galli <mgalli@telasocial.com> 
 */

var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http");
 
function test_getAndSaveImage(name, href) {

	var host = url.parse(href).host;
	var path = url.parse(href).pathname;
        var options = {
            host: host,
            port: 80,
            path: path
        };
        var request = http.get(options);

        request.on('response', function (res) {
           var bufferedData = "";
           res.setEncoding('binary');
           res.on('data', function (dataBuffer) {
		bufferedData+=dataBuffer;	
               });
           res.on('end', function () {
                fs.writeFile('channel/'+name+'', bufferedData, 'binary', function(err){
                  if (err) throw err;
                  console.log('file saved');
                });
           });
       });
}

sys.puts("Trying to open http://www.taboca.com/output/vendor-taboca/logomini.png");

test_getAndSaveImage("marcio.png", "http://www.taboca.com/output/vendor-taboca/logomini.png");



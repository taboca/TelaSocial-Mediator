var sys = require("sys"),
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    qs = require("querystring"),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

function ruleLoadSaveRSS(name, href, appPath) {

	var buffer = "";
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
       method: 'GET',
       headers: {
            'Content-Type': 'application/json'
       },
       path: path+search
   };
 

   var strOut = "";
   var accept = false;
   var request = http.request(options);
   request.end();

   // This is network error
   request.on('error', function (e) {
             out.senderr({'result':'error','type':'offline','data':e} );
   });

   request.on('response', function (res) {
      var strOut = "";

      res.setEncoding('binary')

      res.on('data', function (buffer) {
              strOut += buffer;
      });
      res.on('end', function () {

          var filePath = pathFS.join( __dirname, '..', appPath, 'channel', name+'.txt');
          fs.writeFile(filePath, strOut, 'binary', function(err){
           if (err) { 
             out.senderr({'result':'error', 'payload': err});
             throw err; 
           }   
           // warning: we need to clear the timer...
           out.send({'result':'ok'});
           clearTimeout(timer);
          });
      });
   })
}

out.send({'result':'note', 'data':'Will open + '+ process.argv[3] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },15000); 
ruleLoadSaveRSS(process.argv[2], process.argv[3], process.argv[4]);


var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    qs = require("querystring"),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

function ruleLoadSaveRSS(name, href) {

	var buffer = "";
	var host = url.parse(href).host;
	var path = url.parse(href).pathname;
        var options = {
            host: host,
            port: 80,
            path: path
        };

   var request = http.get(options);
   var strOut = "";
   // This is network error
   request.on('error', function (e) {
             out.senderr({'result':'error','type':'offline','data':e} );
   });
   request.on('response', function (res) {
      var strOut = "";
     res.on('data', function (buffer) {
           strOut += buffer;
      });
      res.on('end', function () {
          fs.writeFile('channel/'+name+'.xml', strOut, 'utf8', function(err){
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
timer = setTimeout(function () { out.send({'result':'expired'}) },5000); 
ruleLoadSaveRSS(process.argv[2], process.argv[3]);


var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    httpAgent = require('http-agent'),
    qs = require("querystring"),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

function ruleLoadSaveRSS(name, href) {

	var buffer = "";
	var host   = url.parse(href).host;
	var path   = url.parse(href).pathname;

	var search ='';
	var searchProbe = url.parse(href).search;
	if(typeof searchProbe != 'undefined') { 
		search=searchProbe;	
	} 

        var options = [
		{
            method: 'GET',
            uri: host+path+search
		}
        ];

   var strOut = "";

   var request = httpAgent.create(host, options);
   //var request = http.request(options);
   //request.end();
   // This is network error

   request.addListener('error', function (e, request) {
        out.senderr({'result':'error','type':'offline','data':e} );
   });

   request.addListener('next', function (e, request) {
	strOut += request.body;
	request.next();
   });
 
   request.addListener('stop', function (e, request) {
      fs.writeFile('channel/'+name+'.xml', strOut, 'utf8', function(err){
       if (err) { 
         out.senderr({'result':'error', 'payload': err});
         throw err; 
       }   
       out.send({'result':'ok'});
       clearTimeout(timer);
      });
   });

   request.start();

}

out.send({'result':'note', 'data':'Will open + '+ process.argv[3] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },15000); 
ruleLoadSaveRSS(process.argv[2], process.argv[3]);


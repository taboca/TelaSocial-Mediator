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

   setTimeout(function () {
     out.senderr({'result':'error','type':'offline','data':'none test'} );
   },5000);

}

/* Remember to clear the timeouts */
timer = setTimeout(function () { out.send({'result':'expired'}) },15000);
getAndSaveImage(process.argv[2], process.argv[3], process.argv[4]);

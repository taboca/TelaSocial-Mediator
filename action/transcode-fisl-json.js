var sys = require("sys"),
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    xml2js = require('xml2js'),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

function start(name, appPath) {

    var href = 'http://fisl.org.br/14/papers_ng/public/fast_grid?event_id=3';
    var href = 'http://papers.softwarelivre.org/papers_ng/public/fast_grid?event_id=4';

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

    var options = {
       host: host,
       port: port,
       method: 'GET',
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
            var parser = new xml2js.Parser({'mergeAttrs':true});
            parser.addListener('end', function(result) {
                for(var i=0;i<result.response.slots[0].slot.length;i++) { 
                    console.log('-------'+JSON.stringify(result.response.slots[0].slot[i].id));
                    //result.response.slots[0].slot[i].title='';
                    result.response.slots[0].slot[i].abstract='';
                    //result.response.slots[i].abstract='';
                } 
                var strOut = JSON.stringify(result.response);
                var filePath = pathFS.join( __dirname, '..', appPath, 'channel', name+'.json');
                fs.writeFile(filePath, strOut, 'utf-8', function(err){
                  if (err) { 
                    out.senderr({'result':'error', 'payload': err});
                    throw err; 
                  }   
                  out.send({'result':'ok'});
                  clearTimeout(timer);
                });
            });
            parser.parseString(strOut);

      });
   })

}

out.send({'result':'note', 'data':'Will open + '+ process.argv[3] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },15000); 
start(process.argv[2], process.argv[3], process.argv[4]);


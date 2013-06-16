var sys = require("sys"),
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    config = require('../config.js'),
    httpAgent = require('http-agent'),
    qs = require("querystring"),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

console.log(config);
var URL = config.url_eventos_pti;

function initApp(name, appPath) {

	var buffer = "";

  	var currDate = new Date();
	var cD = currDate.getDate();
	var cM = currDate.getMonth()+1;
	var cY = currDate.getFullYear();


  var options = [
             {
            method: 'GET',
            uri:URL+cD+'/'+cM+'/'+cY+'&sala=170'
                },
                {
            method: 'GET',
            uri:URL+cD+'/'+cM+'/'+cY+'&sala=169'
                },
                 {
            method: 'GET',
            uri:URL+cD+'/'+cM+'/'+cY+'&sala=168'
                },
                {
            method: 'GET',
            uri:URL+cD+'/'+cM+'/'+cY+'&sala=167'
                }
  
        ];

   var strOut = "";
   var collections = new Array();
   var cc=0;

   var request = httpAgent.create('http://eventos.pti.og.br', options);

   request.addListener('error', function (e, request) {
        out.senderr({'result':'error','type':'offline','data':e} );
   });

   request.addListener('next', function (e, request) {
	var strProbe = request.body;
	var jsonProbe = null;
	try { 
		jsonProbe = JSON.parse(strProbe); 
	} catch (i) { 
		out.send({'result':'note', 'data':'error undefined json from pti'} );
		jsonProbe = [];
	}  
	collections[cc]=jsonProbe;
	cc++;

	strOut += request.body;
	request.next();
   });
 
   request.addListener('stop', function (e, request) {

      var buffJSON = [];
      for(var i=0;i<collections.length;i++) { 
        for(var j=0;j<collections[i].length;j++) { 
          buffJSON.push(collections[i][j]);
        } 
      } 

      strOut= JSON.stringify(buffJSON);
      var filePath = pathFS.join( appPath, 'channel', name+'.txt');
      fs.writeFile( filePath, strOut, 'utf8', function(err){
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

out.send({'result':'note', 'data':'JS running '+ process.argv[1] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },15000); 

initApp(process.argv[2], process.argv[3]);


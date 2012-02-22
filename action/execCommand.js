var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    qs = require("querystring"),
    util   = require('util'),
    exec  = require('child_process').exec,
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

function execCommand(argument) {

  var child = exec(argument, 
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });

}

out.send({'result':'note', 'data':'Will open + '+ process.argv[2] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },15000); 
execCommand(process.argv[2]);


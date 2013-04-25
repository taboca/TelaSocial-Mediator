var sys = require("sys"),
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    forever = require("forever"),
    qs = require("querystring"),
    util   = require('util'),
    spawn  = require('child_process').spawn,
    exec  = require('child_process').exec,
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

// Eventually we can use options (  spawn(arg1,[args]) )

function execCommand(argument, appPath) {

  console.log(argument);

  a=argument.split(',');
  var params = new Array(); 
  for(var i=1;i<a.length;i++) { 
	params.push(a[i]);
  } 

  var filePath = pathFS.join( __dirname, '..', appPath, a[0]);
  var child = exec(filePath,params);

  var outBuffer = '';
 
child.stdout.on('data', function (data) {
  console.log('stdout : ' + data);
  outBuffer=data;
});

child.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

child.on('exit', function (code) {
  console.log('child process exited with code ' + code);
  out.send({'result':'store','data':outBuffer});
  out.send({'result':'ok'});
});

}

out.send({'result':'note', 'data':'Will open + '+ process.argv[2] + ' in ' + process.argv[3] } );
//timer = setTimeout(function () { out.send({'result':'expired'}) },15000); 
execCommand(process.argv[2], process.argv[3]);


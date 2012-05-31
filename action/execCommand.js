var sys = require("sys"),
    path = require("path"),
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

function execCommand(argument) {

  //var child = exec('/usr/bin/open',[argument]);
  var child = exec([argument]);
 
  //var child = spawn('/usr/bin/open', [argument, '--args','-P test', '-no-remote']);
  out.send({'result':'ok'});

/*, 
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });
*/

child.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

child.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
});

child.on('exit', function (code) {
  console.log('child process exited with code ' + code);
});


}

out.send({'result':'note', 'data':'Will open + '+ process.argv[2] } );
//timer = setTimeout(function () { out.send({'result':'expired'}) },15000); 
execCommand(process.argv[2]);


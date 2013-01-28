/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. 
  
 * Contributor: Marcio Galli <mgalli@telasocial.com> 
 */

var sys = require("sys"),
    util   = require('util'),
    exec  = require('child_process').exec,
    child;

function callResize( localStrPath1, resizeWidth, localStrPath2) {

  child = exec('convert '+localStrPath1 + ' -resize ' + resizeWidth +' ' + localStrPath2, 
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
  });

}

sys.puts("This expects ImageMagik convert installed in global path  ");
sys.puts("Pass path to image input and resize and path to output  ");
sys.puts("Trying to resize "+ process.argv[2] + " using width = " + process.argv[3] + "  and to save to " + process.argv[4] );

callResize(process.argv[2], process.argv[3], process.argv[4]);



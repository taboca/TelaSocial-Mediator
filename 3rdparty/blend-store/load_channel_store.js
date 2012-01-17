var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    qs = require("querystring"),
    rss = require('../.././3rdparty/node-rss/node-rss');
 
var files   = [];
var strBuffer = "";

/* uses walk 
   https://github.com/coolaj86/node-walk
*/

exports.mergeAndSave = function (storeDir, callBack) { 
    walker = fs.readdir('./channel/store/' + storeDir, function (err, files) { 
	callBack(files,err);
    });

/*
    walker.on('file', function(root, stat, next) {
        // Add this file to the list of files
        files.push(root + '/' + stat.name);
	strBuffer+='.';
        next();
    });
    walker.on('end', function() {
        sys.puts("Have all files here... and calling the callback in mediator" );
    });
*/
} 


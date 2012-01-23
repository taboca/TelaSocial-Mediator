var sys = require("sys"),
    path = require("path"),
    fs = require("fs");
 
var files   = [];

exports.mergeAndSave = function (storeDir, callBack) { 
    walker = fs.readdir('./channel/store/' + storeDir, function (err, files) { 
	callBack(files,err);
    });

} 


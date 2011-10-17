/*

The following code snippet was take from project

https://github.com/scaron/node.js-demo/blob/master/README

Which claims as MIT 

Copyright (c) 2010 Stephane Caron authored July 26, 2010 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var forever = require('forever'),
    path = require("path"),
    sys = require("sys");

var MAXITEMS = 20;

// This method handles the feed push and querying.
exports.feed = new function () {
	var real_time_items = [],callbacks = [];

	this.appendMessage = function (json) {
		real_time_items.push( json );
		sys.puts(new Date() + ": " + JSON.parse(json).type + " pushed");
		while (callbacks.length > 0)
			callbacks.shift().callback([JSON.parse(json)]);
		while (real_time_items.length > MAXITEMS)
			real_time_items.shift();
	}

	this.appendInStore = function (store,json) {
	    script = path.join(__dirname, 'save_channel_store.js');
	    sys.puts("Will exec "+ script + " with arguments " + store + " and " + replacestr(json) );
            // http://www.sitepoint.com/whats-the-best-date-format/
            var filenameStamp = JSON.stringify({ date: new Date() });
            sys.puts("fileName to write :" + filenameStamp); 

            var child1 = new (forever.Monitor)(script,  { max: 1, options: [ store, replacestr(json) , filenameStamp ]  });

            child1.start();
	}

	this.query = function (since, callback) {
		var matching = [];
		for (var i = 0; i < real_time_items.length; i++) {
			var real_time_item = real_time_items[i];
			if (real_time_item.timestamp > since) matching.push(real_time_item)
		}
		if (matching.length != 0) {
			callback(matching);
		} else {
			callbacks.push({ timestamp: new Date(), callback: callback });
		}
	}
};

/*
var NOT_FOUND = "Not Found\n";

function notFound(req, res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.write(NOT_FOUND);
  res.end();
}

*/

function replacestr(cmd) {
  return cmd;
  return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
  //return Buffer(cmd).toString('base64')
};




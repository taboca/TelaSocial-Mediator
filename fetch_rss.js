var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    qs = require("querystring"),
    rss = require('./3rdparty/node-rss/node-rss');
 
function ruleLoadSaveRSS(name, url) {

	var buffer = "";
	var host = url.parse(href).host;
	var path = url.parse(href).path;
        var options = {
            host: host,
            port: 80,
            path: path
        };
        var request = http.get(options);

        request.on('response', function (res) {
            res.on('data', function (buffer) {
       	       fs.writeFile('channel/'+name+'.xml', buffer, 'utf8', function(err){
       	        if (err) throw err
       	        console.log('File saved.')
               });
           });
        })

}

sys.puts("trying to open "+ process.argv[3]);
ruleLoadSaveRSS(process.argv[2], process.argv[3]);

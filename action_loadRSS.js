var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    qs = require("querystring"),
    rss = require('./3rdparty/node-rss/node-rss');
 
function ruleLoadSaveRSS(name, href) {

	var buffer = "";
	var host = url.parse(href).host;
	var path = url.parse(href).pathname;
        var options = {
            host: host,
            port: 80,
            path: path
        };


   var request = http.get(options);

        var strOut = "";

        request.on('response', function (res) {
           var strOut = "";
           res.on('data', function (buffer) {
                strOut += buffer;
           });
           res.on('end', function () {
               fs.writeFile('channel/'+name+'.xml', strOut, 'utf8', function(err){
                if (err) throw err
                console.log('=={"result":"ok"}==');
               });
           });
        })

}

sys.puts("trying to open "+ process.argv[3]);
ruleLoadSaveRSS(process.argv[2], process.argv[3]);

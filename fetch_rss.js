var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    qs = require("querystring"),
    rss = require('./3rdparty/node-rss/node-rss');
 
function ruleLoadSaveRSS(name, url) {
        var feed_url = 'http://www.latinoware.org/en/rss.xml';
        var feed_url = url;
        var buffer = "";
        var response = rss.parseURL(feed_url, function(itemArticle) {
            sys.puts("Got article and items are " + itemArticle.length);

                // This is a hack — we keep an RSS but we will need a lot of 
                // code here to allow mediation with filter ie pipe style 
                // chain of events? 
                buffer += '<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"> <channel><title>proxy social</title>';
            for(i=0; i<itemArticle.length; i++) {
                buffer+='<item><title><![CDATA['+itemArticle[i].title+']]></title>';
                buffer+='<link>'+itemArticle[i].link+'</link>';
                buffer+='<description><![CDATA['+itemArticle[i].description+']]></description>';
                buffer+='<pubDate><![CDATA['+itemArticle[i].pubDate+']]></pubDate></item>';
            }
            buffer+= '</channel></rss>';
            fs.writeFile('channel/'+name+'.xml', buffer, 'utf-8', function(err){
                if (err) throw err
                console.log('File saved.')
            })
        });
}

sys.puts("trying to open "+ process.argv[3]);
ruleLoadSaveRSS(process.argv[2], process.argv[3]);

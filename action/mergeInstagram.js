var sys = require("sys"),
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    httpAgent = require('http-agent'),
    qs = require("querystring"),
    Twit = require('twit'),
    config = require('../config.js'),
    Instagram = require('instagram-node-lib'),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');

Instagram.set('client_id', config.instagram.id);
Instagram.set('client_secret', config.instagram.secret);

/*

Instagram.tags.info({
      name: 'mozilla',
      complete: function(data){
              console.log(data);
                }
});
*/
 
var timer = null; 

function initApp(name, appPath) {

  //var stream = T.stream('statuses/filter', { track: name })
  var bufferRepeat = new Array();

  Instagram.tags.recent({
      name: 'latinoware',
      complete: function(data){
          /*
          for(var k in data) { 
                console.log(data[k].images.standard_resolution);
          } 
          */

        strOut= JSON.stringify(data);
        var filePath = pathFS.join( __dirname, '..',  appPath, 'channel', name+'.json');
        fs.writeFile( filePath, strOut, 'utf8', function(err){
           if (err) { 
               out.senderr({'result':'error', 'payload': err});
               throw err; 
           }   
           out.send({'result':'ok'});
           clearTimeout(timer);
        });
      }
  });

}

out.send({'result':'note', 'data':'JS running '+ process.argv[1] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },60000*30*24); 
initApp(process.argv[2], process.argv[3], process.argv[4] );


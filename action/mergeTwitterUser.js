/// to many files bug..

var sys = require("sys"),
    pathFS = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    httpAgent = require('http-agent'),
    qs = require("querystring"),
    Twit = require('twit'),
    config = require('../config.js'),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 


var listTags = ['DeloitteBR','lidebr','oracledobrasil','Ricamconsult','jdoriajr'];
var userIds = ['353101288','207577470','113675476','160910872','64706049'];

var ll = 6;
var currIndex = 0;


var list         = new Array() 
var bufferRepeat = new Array() 

var T = null;


function initApp(name, appPath) {

    T = new Twit(config.twit);

    for(var i=0;i<listTags.length;i++) { 
      var keyword = listTags[i];
      list[keyword] = new Array();

    }                

    nextCallSerialized(appPath);



}


function nextCallSerialized(appPath) { 

    if(currIndex< listTags.length) { 

      var keyword = listTags[currIndex];

      var options = {
                      screen_name: keyword,
                      count: ll
      };

      T.get('statuses/user_timeline', options , function(err, data) {

            console.log('-======================- user : '+ keyword + ' ===============\n')

            var outFile = null; 

            for (var i = 0; i < data.length ; i++) {
              console.log(data[i].text);
              outFile = tweetsIntoList(data[i], list[keyword], ll);
            }

            saveFile(outFile, appPath, keyword)
            currIndex++;  
            if(currIndex==listTags.length) { 
               out.send({'result':'ok'});
               clearTimeout(timer);
            } else {
                  nextCallSerialized(appPath);
            }
        
      })




    } else {

    }

}

function tweetsIntoList(tweet, list, ll) { 

 console.log('.')
 
 if(list.length<=ll) { 
    list.push(tweet);
 } else { 
 //  list.shift();
 }

  var buffJSON = list; 
  strOut= JSON.stringify(buffJSON);
  return strOut;

}

function saveFile(strOut, appPath, fileName) { 

  var filePath = pathFS.join( appPath, 'channel', fileName+'.txt');
  fs.writeFile( filePath, strOut, 'utf8', function(err){
     if (err) { 
         out.senderr({'result':'error', 'payload': err});
         throw err; 
     }   
  });

}


out.send({'result':'note', 'data':'JS running '+ process.argv[1] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },60000); 
initApp(process.argv[2], process.argv[3], process.argv[4] );




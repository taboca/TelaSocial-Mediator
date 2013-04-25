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

function initApp(name, appPath) {

var T = new Twit(config.twit);

var stream = T.stream('statuses/filter', { track: name })

var list = new Array() 

var ll = 12; 

var bufferRepeat = new Array();

stream.on('error', function (info) { 
  console.log('111111111' + info);
});

stream.on('disconnect', function (info) { 
  console.log('action/mergeTwitter.js: disconnect: '  + info);
  out.send({'result':'ok'});
  clearTimeout(timer);
});

stream.on('tweet', function (tweet) {

  var strOut = "";
  
  console.log('.')
  var addTo = true; 
  if(typeof bufferRepeat[tweet.text] == 'undefined') { 
      bufferRepeat[tweet.text] =1
      console.log('' + tweet.text);
  } else { 
      bufferRepeat[tweet.text] +=1;
      addTo = false;
      console.log('-----------' + tweet.text);
  }  
 
  if(addTo) { 
     list.push(tweet);
     if(list.length>ll) { 
      list.shift();
     }
  }

  var userUniqueArray=new Array();
  for(var i=0;i<list.length;i++) {
      //  dump(a[i].created_at+ ' - ' + a[i].text);/a
          userUniqueArray['-'+list[i].user.screen_name]=list[i];
  } 

  var list2 = new Array();

  for(var k in userUniqueArray) {
         user = userUniqueArray[k];
         list2.push(user);
  }
  var buffJSON = list2; 

  strOut= JSON.stringify(buffJSON);
  //strOut = list.length;
  var filePath = pathFS.join( appPath, 'channel', name+'.txt');
       // fs.writeFile(filePath, strOut, 'binary', function(err){
  fs.writeFile( filePath, strOut, 'utf8', function(err){
     if (err) { 
         out.senderr({'result':'error', 'payload': err});
         throw err; 
     }   
     //out.send({'result':'ok'});
//     clearTimeout(timer);
  });

});

}

out.send({'result':'note', 'data':'JS running '+ process.argv[1] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },60000*30*24); 
initApp(process.argv[2], process.argv[3], process.argv[4] );


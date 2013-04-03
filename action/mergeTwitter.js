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

//
//  tweet 'hello world!'
//
/*
T.post('statuses/update', { status: 'hello world!' }, function(err, reply) {
  //  ...
});
*/
      
//
//  search twitter for all tweets containing the word 'banana' since Nov. 11, 2011
//
/*
T.get('search/tweets', { q: 'pti_brasil', since: '2011-11-11' }, function(err, reply) {
      var max = 0, popular;
      var tweets = reply.statuses , i = tweets.length;
      while(i--) {
        var tweet = tweets[i];
          console.log( tweet.created_at + ' from ' + tweet.user.name + ' says ' + tweet.text);
      }
});
*/
//
//  stream a sample of public statuses
//
/*
var stream = T.stream('statuses/sample')

stream.on('tweet', function (tweet) {
  console.log(tweet); 
});
      
*/
//
//  filter the twitter public stream by the word 'go'. 
//
var stream = T.stream('statuses/filter', { track: name })
//var stream = T.stream('user', { track:'' })

var list = new Array() 

var ll = 12; 

var bufferRepeat = new Array();

stream.on('tweet', function (tweet) {

  var strOut = "";

//  console.log(tweet);
  
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
timer = setTimeout(function () { out.send({'result':'expired'}) },60000*30); 
initApp(process.argv[2], process.argv[3], process.argv[4] );


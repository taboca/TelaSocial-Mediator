var sys = require("sys"),
    path = require("path"),
    fs = require("fs")
    url = require("url"),
    http = require("http"),
    httpAgent = require('http-agent'),
    qs = require("querystring"),
    Twit = require('twit'),
    config = require('../config.js'),
    out = require('../3rdparty/stdout-2-json/stdout-2-json');
 
var timer = null; 

function initApp(name) {

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
T.get('search/tweets', { q: 'seminarionacional', since: '2011-11-11' }, function(err, reply) {
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
//  filter the twitter public stream by the word 'mango'. 
//
var stream = T.stream('statuses/filter', { track: 'latinoware' })
stream.on('tweet', function (tweet) {
  console.log(tweet);

});

}

out.send({'result':'note', 'data':'JS running '+ process.argv[1] } );
timer = setTimeout(function () { out.send({'result':'expired'}) },1015000); 
initApp(process.argv[2], process.argv[3]);


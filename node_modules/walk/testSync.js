(function () {
  "use strict";

  var walk = require('./lib/walk')
    , _ = require('underscore')
    , fs = require('fs')
    , sync = false
    , walker;

  console.log(walk);

  walker = walk.walk(".");

  walker.on("directory", function (root, dirStatsArray, next) {
    // dirStatsArray is an array of `stat` objects with the additional attributes
    // * type
    // * error
    // * name
    //console.log(_.pluck(dirStatsArray, 'name'));
    console.log(root + '/' + dirStatsArray.name);
    
    next();
  });

  walker.on("file", function (root, fileStats, next) {
    console.log(root + '/' + fileStats.name);

    next();
  });

  walker.on("errors", function (root, nodeStatsArray, next) {
    //console.log(nodeStatsArray);

    next();
  });

  walker.on("end", function () {
    console.log("all done");
  });
}());

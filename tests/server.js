var server = module.exports = require('net').createServer();
var sys = require("util");

// http://groups.google.com/group/nodejs/browse_thread/thread/f21b86128d5c5b18
// returns null , read above
sys.log(server.address().address);

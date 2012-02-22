// This depends on var npm install ftp-server 
// Which is https://github.com/naholyr/node-ftp-server


var ftpd = require('../3rdparty/nodeftpd/ftpd.js')

var server = ftpd.createServer("10.0.0.3", "./channel/store/ftpserver");

//ftpd.fsOptions.root = './channel/store/ftpserver';
//ftpd.listen(7001, '10.0.0.3');

// this event passes in the client socket which emits further events
// but should recommend they don't do socket operations on it
// so should probably encapsulate and hide it

server.on("client:connected", function(socket) {
    var username = null;
    console.log("client connected: " + socket.remoteAddress);
    socket.on("command:user", function(user, success, failure) {
        if (user) {
            username = user;
            success();
        } else failure();
    });

    socket.on("command:pass", function(pass, success, failure) {
        if (pass) success(username);
        else failure();
    });
});
server.debugging = 4;
server.listen(7001);


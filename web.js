var http = require('http');
var url = require('url');
var fs = require('fs');
var path = require('path');

var server = http.createServer(function (req, res) {
  console.log(req.method + ' ' + req.url);
  
  var parsedUrl = url.parse(req.url);
  var pathname = '.' + parsedUrl.pathname;
  
  var mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'applicaion/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/font-sfnt'
  };
  
  fs.exists(pathname, function (exist) {
    if (!exist) {
      res.statusCode = 404;
      res.end('File ' + pathname + ' not found!');
      return;
    }
    
    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html';
    }
    
    fs.readFile(pathname, function (err, data) {
      if (err) {
        res.statusCode = 500;
        res.end('Error getting the file: ' + err);
      } else {
        var ext = path.parse(pathname).ext;
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
      }
    });
  });
});

var port = process.env.PORT || 3000;

server.listen(port);

console.log("Server listening on port " + port);

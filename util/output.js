var exports = module.exports = {};

var readline = require('readline');
var spawn = require('child_process').spawn;

exports.lineOutput = function (socket, process, event, increment) {
  var donePercent = 0;
  readline.createInterface({
    input     : process.stdout,
    terminal  : false
  }).on('line', function(data) {
    if ((donePercent + increment) <= 90) {
      donePercent += increment;
    }
    console.log(data);
    socket.emit(event, {donePercent: donePercent, data: data});
  });
};

exports.lineError = function (socket, process, event) {
  readline.createInterface({
    input     : process.stderr,
    terminal  : false
  }).on('line', function(data) {
    console.log(data);
    socket.emit(event, data);
  });
};

exports.retrieveLogs = function (socket, name, data) {
  var process = spawn('cat', [ 'temp/' + data.email + '/' + name + '_' + data.uniqueId + '.txt' ]);

  process.stdout.setEncoding('utf-8');
  process.stdout.on('data', function (data) {
    console.log("emiting file cotente");
    socket.emit('file-content', data);
  });

};

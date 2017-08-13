var exports = module.exports = {};

var readline = require('readline');
var spawn = require('child_process').spawn;

exports.lineOutput = function (socket, spawnedProcess, event, increment) {
  var donePercent = 0;
  readline.createInterface({
    input     : spawnedProcess.stdout,
    terminal  : false
  }).on('line', function(data) {
    if ((donePercent + increment) <= 90) {
      donePercent += increment;
    }
    console.log(data);
    socket.emit(event, {donePercent: donePercent, data: data});
  });
};

exports.lineError = function (socket, spawnedProcess, event) {
  readline.createInterface({
    input     : spawnedProcess.stderr,
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

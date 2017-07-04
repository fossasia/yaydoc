var exports = module.exports = {};

var readline = require('readline');

exports.lineOutput = function (socket, process, event, increment) {
  var donePercent = 0;
  readline.createInterface({
    input     : process.stdout,
    terminal  : false
  }).on('line', function(data) {
    if (donePercent <= 90) {
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

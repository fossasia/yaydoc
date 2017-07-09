var output = require('./output.js');
exports.handleSocket = function(socket, tag, data) {
  if (socket.emit != undefined) {
    socket.emit(tag, data)
  }
}

exports.handleLineOutput = function(socket, process, tag, increment) {
  if (socket.emit != undefined) {
    output.lineOutput(socket, process, tag, increment);
  }
}

exports.handleLineError = function(socket, process, tag) {
  if (socket.emit != undefined) {
    output.lineError(socket, process, tag);
  }
}

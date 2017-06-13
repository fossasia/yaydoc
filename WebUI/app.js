var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var uuidV4 = require("uuid/v4");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
app.io = io;

var index = require("./routes/index");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", index);

io.on('connection', function(socket){
  socket.on('execute', function (formData) {
    console.log(formData.email);
    executeScript(socket, formData);
  });
});

var executeScript = function (socket, formData) {
  var spawn = require('child_process').spawn;
  
  var email = formData.email;
  var gitUrl = formData.gitUrl;
  var author = formData.author;
  var docTheme = formData.docTheme;
  var docPath = formData.docPath;
  var projectName = formData.projectName;
  var version = formData.version;
  var uniqueId = uuidV4();

  var donePercent = 0;
  
  const args = [
    "-g", gitUrl,
    "-a", author,
    "-t", docTheme,
    "-p", docPath,
    "-o", projectName,
    "-v", version,
    "-m", email,
    "-u", uniqueId
  ];
  
  var process = spawn("./generate.sh", args);
  
  process.stdout.on('data', function (data) {
    console.log(data.toString());
    socket.emit('logs', {donePercent: (donePercent = donePercent + 4), data: data.toString()});
  });
  
  process.stderr.on('data', function (data) {
    console.log(data.toString());
    socket.emit('err-logs', data.toString());
  });
  
  process.on('exit', function (code) {
    console.log('child process exited with code ' + code);
    if (code === 0) {
      socket.emit('success', {email: email, uniqueId: uniqueId});
    }
  });
  
};


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

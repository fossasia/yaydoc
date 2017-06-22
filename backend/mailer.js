var exports = module.exports = {};

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var hostname =require('../routes/index').hostname;

exports.sendEmail = function (data) {
  var options = {
    service: 'SendGrid',
    auth: {
      api_user: process.env.SENDGRID_USERNAME,
      api_key: process.env.SENDGRID_PASSWORD
    }
  };
  
  var client = nodemailer.createTransport(sgTransport(options));
  
  var previewURL = 'http://' + hostname + '/preview/' + data.email + '/' + data.uniqueId + '_preview';
  var downloadURL = 'http://' + hostname + '/download/' + data.email + '/' + data.uniqueId;
  var deployURL = 'http://' + hostname + '/github?email=' + data.email + '&uniqueId=' + data.uniqueId + '&gitURL=' + data.gitUrl;
  
  var textContent = 'Hey! Your documentation generated successfully. Preview it here: ' + previewURL +
                    '. Download it here: ' + downloadURL + '. Deploy it here: ' + deployURL;
  var htmlContent = 'Hey!<br />' +
                    'Your documentation generated successfully.<br />' +
                    'Preview it <a href="' + previewURL +'" target="_blank">here</a><br />' +
                    'Download it <a href="' + downloadURL +'" target="_blank">here</a><br />' +
                    'Deploy it <a href="' + deployURL +'" target="_blank">here</a><br /><br />' +
                    'Thank you for using Yaydoc!';
  
  client.sendMail({
    from: 'info@yaydoc.com',
    to: data.email,
    subject: 'Preview your generated docs - Yaydoc',
    text: textContent,
    html: htmlContent
  }, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + info.response);
    }
  });
  
};
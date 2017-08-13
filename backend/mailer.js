var exports = module.exports = {};

var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var jade = require('jade');
var hostname =process.env.HOSTNAME || 'yaydoc.herokuapp.com';
var validation = require('../public/scripts/validation.js');

const options = {
  service: 'SendGrid',
  auth: {
    api_user: process.env.SENDGRID_USERNAME,
    api_key: process.env.SENDGRID_PASSWORD
  }
};

exports.sendEmail = function (data) {
  var client = nodemailer.createTransport(sgTransport(options));

  var previewURL = data.previewURL;
  var downloadURL = 'http://' + hostname + '/download/' + data.email + '/' + data.uniqueId;
  var githubDeployURL = "";
  if (validation.isGithubHTTPS(data.gitUrl)) {
    githubDeployURL = 'http://' + hostname + '/auth/github?email=' + data.email + '&uniqueId=' + data.uniqueId + '&gitURL=' + data.gitUrl;
  }
  var herokuDeployURL = 'http://' + hostname + '/auth/heroku?email='+data.email+'&uniqueId='+data.uniqueId;

  var textContent = 'Hey! Your documentation generated successfully. Preview it here: ' + previewURL +
                    '. Download it here: ' + downloadURL ;
  if (githubDeployURL !== "") {
    textContent += '. Deploy to Github Pages: ' + githubDeployURL;
  }

  textContent += '.Deploy to Heroku: ' + herokuDeployURL + '.';

  var emailTemplate = jade.compileFile(`${__dirname}/../views/template/email.jade`);
  var htmlContent = emailTemplate({
      previewURL: previewURL,
      downloadURL: downloadURL,
      githubDeployURL: githubDeployURL,
      herokuDeployURL: herokuDeployURL
  });

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

exports.sendMailOnBuild = function (buildStatus, email, repository) {
  var client = nodemailer.createTransport(sgTransport(options));
  var status = buildStatus ? "Passed" : "Failed";

  var textContent = status + ': ' + repository.name + ' - Yaydoc';
  var htmlContent = status + ': ' + repository.name + ' - Yaydoc';

  client.sendMail({
    from: 'info@yaydoc.com',
    to: email,
    subject: status + ': ' + repository.name + ' - Yaydoc',
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

var exports = module.exports = {};

var nodemailer = require('nodemailer');
var jade = require('jade');
var hostname =process.env.HOSTNAME || 'yaydoc.herokuapp.com';
var validation = require('../public/scripts/validation.js');

var client = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

exports.sendEmail = function (data) {
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
    from: 'info@yaydoc.org',
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
  var status = buildStatus ? "Passed" : "Failed";

  var textContent = status + ': ' + repository.name + ' - Yaydoc';
  var htmlContent = status + ': ' + repository.name + ' - Yaydoc';

  client.sendMail({
    from: 'info@yaydoc.org',
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

exports.sendMailOnTokenFailure = function (email) {
  var textContent = 'Access token for Yaydoc is expired. Sign in once again to continue the service';
  var htmlContent = 'Access token for Yaydoc is expired. Sign in once again to continue the service';

  client.sendMail({
    from: 'info@yaydoc.com',
    to: email,
    subject: 'Token expired - Yaydoc',
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

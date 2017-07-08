require('dotenv').config({ path: './.env'});
const sinon = require("sinon");
const assert = require('assert');
const crypter = require('../util/crypter');

sinon.stub(require("child_process"), "spawn").callsFake(function (fileName, args) {
  if (fileName !== "./ghpages_deploy.sh" && fileName !== "./heroku_deploy.sh" && fileName !== "./generate.sh") {
    throw new Error(`invalid ${fileName} invoked`);
  }
  if (fileName === "./ghpages_deploy.sh") {
    let ghArgs = ["-e", "-i", "-n", "-o", "-r"];
    ghArgs.forEach(function (x) {
      if (args.indexOf(x) < 0) {
        throw new Error(`${x} argument is not passed`);
      }
    })
  }
  if (fileName === "./heroku_deploy.sh") {
    let herokuArgs = ["-e", "-u", "-h", "-n"];
    herokuArgs.forEach(function (x) {
      if (args.indexOf(x) < 0) {
        throw new Error(`${x} argument is not passed`);
      }
    });
  }
  if (fileName === "./generate.sh") {
    let generateArgs = ["-g", "-t", "-m", "-d", "-u", "-s", "-p"];
    generateArgs.forEach(function (x) {
      if (args.indexOf(x) < 0) {
        throw new Error(`${x} argument is not passed`);
      }
    });
  }
  let process = {
    on: function (listenerId, callback) {
      if (listenerId !== "exit") {
        throw new Error("listener id is not exit");
      }
    }
  }
  return process;
});

function lineOutput(socket, process, event, increment) {
  if (socket === undefined) {
    throw Error("socket object is not passed in the lineOutput");
  }
  if (process === undefined) {
    throw Error("process object is not passed in the lineOutput");
  }
  if (event === undefined) {
    throw Error("event object is not passed in the lineOutput");
  }
  if (increment === undefined) {
    throw Error("increment object is not passed in the lineOutput");
  } else {
    if (typeof increment === 'number') {
      if (increment < 0 ) {
        throw Error("increment is less than 0");
      } else if (increment > 100) {
        throw Error("increment is greater than 0");
      }
    } else {
      throw Error("increment should be a number");
    }
  }
}

function lineError(socket, process, event) {
  if (socket === undefined) {
    throw Error("socket object is not passed in the lineOutput");
  }
  if (process === undefined) {
    throw Error("process object is not passed in the lineOutput");
  }
  if (event === undefined) {
    throw Error("event object is not passed in the lineOutput");
  }
}

sinon.stub(require("../util/socketHandler"), "handleLineOutput").callsFake(lineOutput);

sinon.stub(require("../util/socketHandler"), "handleLineError").callsFake(lineError);

sinon.stub(require("../util/output"), "lineOutput").callsFake(lineOutput);

sinon.stub(require("../util/output"), "lineError").callsFake(lineError);

let fakeSocket = {
  emit: function(){
  }
};

fakeSocket = sinon.stub(fakeSocket, "emit").callsFake(function (listener, data) {
  if (listener !== "heroku-success" && listener !== "heroku-failure") {
    throw new Error(`${listener} is not valid listener`);
  }
});

let deploy = require('../backend/deploy');

describe('deploy script', function() {
  it("gh-pages deploy", function() {
    deploy.deployPages(fakeSocket, {
      gitURL: "https://github.com/sch00lb0y/yaydoc.git",
      encryptedToken: crypter.encrypt("dummykey"),
      email: "admin@fossasia.org",
      uniqueId: "ajshdahsdh",
      username: "fossasia"
    });
  });

  it("Heroku deploy", function() {
    deploy.deployHeroku(fakeSocket, {
      email: "admin@fossasia.org",
      herokuAppName: "yaydoc",
      herokuAPIKey: crypter.encrypt("dummykey"),
      uniqueId: "ajshdahsdh"
    });
  });
});

let generator = require('../backend/generator');

describe("Documentation generator", function() {
  it("generate script", function () {
    generator.executeScript(fakeSocket, {
      email: "admin@fossasia.org",
      gitUrl: "https://github.com/fossasia/yaydoc",
      docTheme: "",
      debug: "true"
    });
  });
});

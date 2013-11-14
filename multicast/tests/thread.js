var child_process = require('child_process');

var runTask = function (runnable) {
  var proc = child_process.spawn('node', ['-e', "(" + runnable.toString() + ")()"]),
  outputData = function (data) {
    console.log(data.toString('utf-8'));
  };
  proc.stdout.on('data', outputData);
  proc.stderr.on('data', outputData);
};

module.exports.runTask = runTask;
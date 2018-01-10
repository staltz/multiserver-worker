const pull = require('pull-stream');
const MultiServer = require('multiserver');
const workerPlugin = require(__dirname + '/index');

var ms = MultiServer([workerPlugin({ worker: self })]);

ms.server(function(stream) {
  pull(stream, pull.map(s => s.toUpperCase()), stream);
});

const pull = require('pull-stream');
const MultiServer = require('multiserver');
const muxrpc = require('muxrpc');
const workerPlugin = require(__dirname + '/index');

var manifest = {
  stuff: 'source'
};

var ms = MultiServer([workerPlugin({ worker: self })]);

ms.server(function(stream) {
  var server = muxrpc(null, manifest, x => x)({
    stuff: function() {
      return pull.values([2, 4, 6, 8]);
    }
  });

  pull(stream, server.createStream(), stream);
});

var pull = require('pull-stream');
var test = require('tape');
var muxrpc = require('muxrpc');
var Worker = require('tiny-worker');
var MultiServer = require('multiserver');
var workerPlugin = require('./index');

test('basic server and client work correctly', function(t) {
  var ms = MultiServer([
    workerPlugin({ path: 'test-worker1.js', ctor: Worker })
  ]);

  ms.client('worker:test-worker1.js', function(err, stream) {
    t.error(err, 'no error initializing multiserver');
    pull(
      pull.values(['alice', 'bob']),
      stream,
      pull.collect(function(err2, arr) {
        t.error(err2, 'no error from worker');
        t.deepEqual(arr, ['ALICE', 'BOB'], 'data got uppercased in the worker');
        t.end();
      })
    );
  });
});

test('muxrpc server and client work correctly', function(t) {
  var manifest = {
    stuff: 'source'
  };

  var ms = MultiServer([
    workerPlugin({ path: 'test-worker2.js', ctor: Worker })
  ]);

  ms.client('worker:test-worker2.js', function(err, stream) {
    t.error(err, 'no error initializing multiserver');
    var client = muxrpc(manifest, null, x => x)();
    pull(
      client.stuff(),
      pull.collect(function(err2, arr) {
        t.error(err2, 'no error from worker');
        t.deepEqual(arr, [2, 4, 6, 8], 'got data sourced from the worker');
        t.end();
      })
    );
    pull(stream, client.createStream(), stream);
  });
});

test('forcefully exit even if some child workers are running', function(t) {
  t.end();
  process.exit(0);
});

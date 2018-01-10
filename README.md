# multiserver-worker

_A [multiserver](https://github.com/ssbc/multiserver) plugin for Web Workers_

```
npm install --save multiserver-worker
```

This module is a multiserver plugin which allows a Web Worker to be a server and the main JS thread to be the client. It is intended **only for UI development**, although it also supports Workers in Node.js such as those from `tiny-worker`.

## Usage

**main.js**

```js
var pull = require('pull-stream');
var MultiServer = require('multiserver');
var workerPlugin = require('multiserver-worker');

var ms = MultiServer([
  workerPlugin({ path: 'worker.js', ctor: Worker })
]);

ms.client('worker:worker.js', function(err, stream) {
  pull(
    pull.values(['alice', 'bob']),
    stream,
    pull.drain(x => {
      console.log(x); // ALICE
                      // BOB
    })
  );
});
```

**worker.js**

```js
const pull = require('pull-stream');
const MultiServer = require('multiserver');
const workerPlugin = require('multiserver-worker');

var ms = MultiServer([
  workerPlugin({ worker: self })
]);

ms.server(function(stream) {
  pull(
    stream,
    pull.map(s => s.toUpperCase()),
    stream
  );
});
```

(Note: you might need to "browserify" or "workerify" the worker.js before running it in the browser)

## Usage with [muxrpc](https://github.com/ssbc/muxrpc)

This module also supports muxrpc, but beware of the codec, use a passthrough codec `x => x`.

**main.js**

```js
// ...
ms.client('worker:worker.js', function(err, stream) {
  var manifest = {
    stuff: 'source'
  };
  var codec = x => x;
  var client = muxrpc(manifest, null, codec)();

  pull(
    client.stuff(),
    pull.drain(x => {
      console.log(x); // 2
                      // 4
                      // 6
                      // 8
    })
  );

  pull(stream, client.createStream(), stream);
});
// ...
```

**worker.js**

```js
// ...
ms.server(function(stream) {
  var manifest = {
    stuff: 'source'
  };
  var codec = x => x;
  var server = muxrpc(null, manifest, codec)({
    stuff: function() {
      return pull.values([2, 4, 6, 8]);
    }
  });

  pull(stream, server.createStream(), stream);
});
// ...
```
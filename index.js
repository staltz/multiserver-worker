const toDuplex = require('pull-worker');

module.exports = function makePlugin(opts) {
  return {
    name: 'worker',

    server: function(onConnection, onError) {
      const worker = opts && opts.worker;
      if (!worker) {
        onError(
          new Error(
            'multiserver worker plugin requires the worker instance given in ' +
              'the opts argument when starting the worker server'
          )
        );
        return function() {};
      }
      onConnection(toDuplex(worker));
      return function() {
        worker.close();
      };
    },

    client: function(address, cb) {
      const parsed = this.parse(address);
      var worker;
      try {
        let ctor = opts && opts.ctor;
        if (!ctor && typeof Worker !== 'undefined') {
          ctor = Worker;
        } else if (!ctor) {
          throw new Error('Worker constructor is unavailable');
        }
        worker = new ctor(parsed.path);
        const stream = toDuplex(worker);
        stream.worker = worker;
        cb(null, stream);
      } catch (err) {
        cb(err);
      }
    },

    // MUST be worker:<path>
    parse: function(s) {
      var ary = s.split(':');
      if (ary.length < 1) return null;
      if ('worker' !== ary.shift()) return null;
      var path = ary.pop();
      return {
        name: 'worker',
        path: path
      };
    },

    stringify: function() {
      return 'worker:' + opts.path;
    }
  };
};

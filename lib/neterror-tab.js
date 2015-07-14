/* jshint moz:true,esnext:true */
//jscs ignore:start
const { data } = require('sdk/self');
const tabs = require('sdk/tabs');
const { attach, detach } = require('sdk/content/mod');
const { Style } = require('sdk/stylesheet/style');
const { add, remove, iterator } = require('sdk/lang/weak-set');

// keep a list of workers in case more than one tab hits the error page
const workers = new WeakMap();

const style = Style({
  uri: data.url('css/reload.css')
});

function handleTab(tab) {
  // console.log('tab', tab.url);
  var worker = tab.attach({
    contentScriptFile: [data.url('reload.js')]
  });
  worker.port.on('onlined', _ => {
    worker.destroy();
  });
  worker.port.on('neterror', function(message) {
    // console.log('neterror', message);
    add(workers, worker);
    attach(style, tab);
    worker.once('detach', _ => {
      remove(workers, worker);
      try {
        detach(style, worker.tab);
      } catch (ignore) {}
    });
  });

}

tabs.on('open', handleTab);
tabs.on('ready', handleTab);
tabs.on('pageshow', handleTab);
tabs.on('activate', handleTab);

exports.emit = (event) => {
  for (let worker of iterator(workers)) {
    worker.port.emit(event);
  }
};

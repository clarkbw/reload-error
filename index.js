/* jshint moz:true,esnext:true */
//jscs ignore:start

const network = require('./lib/network');
const tabs = require('./lib/neterror-tab');

network.on('up', function() {
  tabs.emit('online');
});

network.on('down', function() {
  tabs.emit('offline');
});

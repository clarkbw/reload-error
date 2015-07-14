/* jshint moz:true,esnext:true */
//jscs ignore:start
const events = require('sdk/system/events');
const { on, off, once, emit } = require('sdk/event/core');

const target = Object.create(null);

function networkListener(event) {
  // console.log('event.subject', event.subject);
  //  {"isLinkUp":false,"linkStatusKnown":true,"linkType":0,
  //    "LINK_TYPE_UNKNOWN":0,
  //    "LINK_TYPE_ETHERNET":1,
  //    "LINK_TYPE_USB":2,
  //    "LINK_TYPE_WIFI":3,
  //    "LINK_TYPE_WIMAX":4,
  //    "LINK_TYPE_2G":5,
  //    "LINK_TYPE_3G":6,
  //    "LINK_TYPE_4G":7}
  // console.log('event.data', event.data);
  //  'up' or 'down'
  // console.log('event.type', event.type);
  //  'network:link-status-changed'
  if (event.subject.linkStatusKnown) {
    if (event.data === 'up' && event.subject.isLinkUp) {
      // console.log('UP');
      emit(target, 'up');
    } else if (event.data === 'down' && !event.subject.isLinkUp) {
      // console.log('DOWN');
      emit(target, 'down');
    }
  }
}

events.on('network:link-status-changed', networkListener);

exports.on = (type, listener) => on(target, type, listener);
exports.once = (type, listener) => once(target, type, listener);
exports.off = (type, listener) => off(target, type, listener);

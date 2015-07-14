/* jshint moz:true,esnext:true */
//jscs ignore:start

// documentURI is the only known way to detect the about:neterror page
if (document.documentURI.startsWith('about:neterror')) {
  let online = false;
  const errors = ['neterror', 'dnsNotFound', 'netOffline', 'connectionFailure'];
  let params = document.documentURI.split('about:neterror?')[1];
  // console.log(params);
  params = new URLSearchParams(params);
  let error = params.get('e');
  // console.log('error', error);
  if (errors.indexOf(error) >= 0) {
    self.port.emit('neterror', {error: error, url: params.get('u')});
  }

  // Handle the process of going back online from being offline
  let goOnline = function() {
    let button = document.querySelector('#errorTryAgain');
    let progress = makeProgress();
    let container = document.querySelector('#errorPageContainer');
    container.insertBefore(progress, button.nextSibling);

    function step() {
      if (!online) { return; }
      let value = parseInt(progress.getAttribute('value'), 10);
      let max = parseInt(progress.getAttribute('max'), 10);
      // console.log('value <= max', value, '<=', max);
      if (value <= max) {
        progress.setAttribute('value', value + 1);
        window.setTimeout(step, 10);
      } else {
        button.dispatchEvent(getClickEvent());
        // notify the add-on to kill this script, we're done
        self.port.emit('onlined');
      }
    }

    window.setTimeout(step, 10);
  };

  self.port.on('offline', function() {
    online = false;
  });

  self.port.on('online', function() {
    online = true;
    goOnline();
  });

  let makeProgress = function() {
    let progress = document.querySelector('#goOnline');
    if (progress) {
      return progress;
    }
    progress = document.createElement('progress');
    progress.setAttribute('id', 'goOnline');
    progress.setAttribute('max', 100);
    progress.setAttribute('value', 0);
    return progress;
  };

  let getClickEvent = function() {
    let event = document.createEvent('HTMLEvents');
    event.initEvent('click', true, false);
    return event;
  };
}

(function (window) {
  window.presentationEngine = {};

  function getEngine() {
    if (window.shower) return {name: 'shower', version: shower.version};  //shower.version is currently undefined
    return {error: 'presentation engine is not recognized'};
  }

  function fillPolyFill() {
    presentationEngine.info = getEngine();
    if (!presentationEngine.info.name) return;

    if (presentationEngine.info.name === 'shower' && !presentationEngine.info.version) {
      presentationEngine.next = shower._turnNextSlide;
      presentationEngine.prev = shower._turnPreviousSlide;
      presentationEngine.zoomIn = shower.enterSlideMode;
      presentationEngine.zoomOut = shower.enterListMode;
      presentationEngine.last = shower.last;
      presentationEngine.first = shower.first;
    }
  }

  fillPolyFill();

  window.addEventListener('message', function(event) {
    if (event.data === 'nexty-get-engine') return window.parent.postMessage(presentationEngine.info, '*');
    if (!presentationEngine.info.name) return window.parent.postMessage('error: ' + presentationEngine.info.error, '*');
    switch (event.data) {
      case 'nexty-next': return presentationEngine.next();
      case 'nexty-prev': return presentationEngine.prev();
      case 'nexty-zoomIn': return presentationEngine.zoomIn();
      case 'nexty-zoomOut': return presentationEngine.zoomOut();
      case 'nexty-last': return presentationEngine.last();
      case 'nexty-first': return presentationEngine.first();
      default: return window.parent.postMessage('error: unrecognized command', '*');
    }
  });

})(window);

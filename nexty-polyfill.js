(function () {
  function getEngine() {
    if (window.shower) return {engine: 'shower', version: undefined};
    return {};
  }

  window.addEventListener('message', function(event) {
    switch (event.data) {
      case 'nexty-get-engine': return window.parent.postMessage(getEngine(), '*');
      case 'nexty-next': return shower._turnNextSlide();
      case 'nexty-prev': return shower._turnPreviousSlide();
      case 'nexty-zoomIn': return shower.enterSlideMode();
      case 'nexty-zoomOut': return shower.enterListMode();
      default: return window.parent.postMessage('unrecognized command', '*');
    }
  });
})();

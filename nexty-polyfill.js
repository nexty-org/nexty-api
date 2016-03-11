(function (window) {
  window.presentationEngine = {};

  function getEngine() {
    if (window.shower) return {name: 'shower', version: shower.version};  //shower.version is currently undefined
    if (window.Reveal) return {name: 'reveal', version: Reveal.version};  //Reveal.version is currently undefined
    if (window.$ && $.deck) return {name: 'deck', version: $.deck.version}; //$.deck.version is currently undefined
    if (window.Flowtime) return {name: 'flowtime', version: Flowtime.version};  //Flowtime.version is currently undefined
    if (window.Fathom) return {name: 'fathom', version: Fathom.version};  //Fathom.version is currently undefined
    if (window.bespoke) return {name: 'bespoke', version: bespoke.version};  //bespoke.version is currently undefined
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

    if (presentationEngine.info.name === 'reveal' && !presentationEngine.info.version) {
      presentationEngine.next = Reveal.next;
      presentationEngine.prev = Reveal.prev;
      presentationEngine.zoomIn = Reveal.toggleOverview.bind(Reveal, false);
      presentationEngine.zoomOut = Reveal.toggleOverview.bind(Reveal, true);
      presentationEngine.last = Reveal.navigateTo.bind(Reveal, 9999, 9999);
      presentationEngine.first = Reveal.navigateTo.bind(Reveal, 0);
      //no up and down - intentionally
    }

    if (presentationEngine.info.name === 'deck' && !presentationEngine.info.version) {
      presentationEngine.next = $.deck.bind($.deck, 'next');
      presentationEngine.prev = $.deck.bind($.deck, 'prev');
      //deck does not support zooming in and out
      presentationEngine.zoomIn = function() {};
      presentationEngine.zoomOut = function() {};
      presentationEngine.last = function() {$.deck('go', $.deck('getSlides').length - 1);};
      presentationEngine.first = $.deck.bind($.deck, 'go', 0);
    }

    if (presentationEngine.info.name === 'flowtime' && !presentationEngine.info.version) {
      presentationEngine.next = Flowtime.nextFragment;
      presentationEngine.prev = Flowtime.prevFragment;
      presentationEngine.zoomIn = Flowtime.showOverview.bind(Flowtime, false);
      presentationEngine.zoomOut = Flowtime.showOverview.bind(Flowtime, true);
      presentationEngine.last = Flowtime.gotoEnd;
      presentationEngine.first = Flowtime.gotoHome;
    }

    if (presentationEngine.info.name === 'fathom' && !presentationEngine.info.version) {
      var $root = $('.slide').parent();
      var sendKeyPress = function(code) {
        var e = jQuery.Event("keydown");
        e.which = e.keyCode = code;
        $root.trigger(e);
      };
      presentationEngine.next = sendKeyPress.bind(null, 39);
      presentationEngine.prev = sendKeyPress.bind(null, 37);
      presentationEngine.zoomIn = function() {};
      presentationEngine.zoomOut = function() {};
      presentationEngine.last = function() {};
      presentationEngine.first = function() {};
    }

    if (presentationEngine.info.name === 'bespoke' && !presentationEngine.info.version) {
      presentationEngine.next = bespoke.next;
      presentationEngine.prev = bespoke.prev;
      presentationEngine.zoomIn = function() {};
      presentationEngine.zoomOut = function() {};
      presentationEngine.last = function() {};
      presentationEngine.first = function() {};
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

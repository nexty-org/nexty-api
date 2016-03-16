(function (window) {
  window.presentationEngine = {};

  function getEngine() {
    if (window.shower) return {name: 'shower', version: shower.version};  //shower.version is currently undefined
    if (window.Reveal) return {name: 'reveal', version: Reveal.version};  //Reveal.version is currently undefined
    if (window.$ && $.deck) return {name: 'deck', version: $.deck.version}; //$.deck.version is currently undefined
    if (window.Flowtime) return {name: 'flowtime', version: Flowtime.version};  //Flowtime.version is currently undefined
    if (window.Fathom) return {name: 'fathom', version: Fathom.version};  //Fathom.version is currently undefined
    if (window.bespoke) return {name: 'bespoke', version: bespoke.version};  //bespoke.version is currently undefined
    if (window.$ && $.jmpress) return {name: 'jmpress', version: $.jmpress.version}; //$.jmpress.version is currently undefined
    if (window.impress) return {name: 'impress', version: impress.version};  //impress.version is currently undefined
    return {error: 'presentation engine is not recognized'};
  }

  function fillPolyFill() {
    presentationEngine.info = getEngine();
    if (!presentationEngine.info.name) return;

    var pe = presentationEngine;

    if (pe.info.name === 'shower' && !pe.info.version) {
      pe.next = shower._turnNextSlide;
      pe.prev = shower._turnPreviousSlide;
      pe.zoomIn = shower.enterSlideMode;
      pe.zoomOut = shower.enterListMode;
      pe.last = shower.last;
      pe.first = shower.first;
    }

    if (pe.info.name === 'reveal' && !pe.info.version) {
      pe.next = Reveal.next;
      pe.prev = Reveal.prev;
      pe.zoomIn = Reveal.toggleOverview.bind(Reveal, false);
      pe.zoomOut = Reveal.toggleOverview.bind(Reveal, true);
      pe.last = Reveal.navigateTo.bind(Reveal, 9999, 9999);
      pe.first = Reveal.navigateTo.bind(Reveal, 0);
      //no up and down - intentionally
    }

    if (pe.info.name === 'deck' && !pe.info.version) {
      pe.next = $.deck.bind($.deck, 'next');
      pe.prev = $.deck.bind($.deck, 'prev');
      //deck does not support zooming in and out
      pe.zoomIn = function() {};
      pe.zoomOut = function() {};
      pe.last = function() {$.deck('go', $.deck('getSlides').length - 1);};
      pe.first = $.deck.bind($.deck, 'go', 0);
    }

    if (pe.info.name === 'flowtime' && !pe.info.version) {
      pe.next = Flowtime.nextFragment;
      pe.prev = Flowtime.prevFragment;
      pe.zoomIn = Flowtime.showOverview.bind(Flowtime, false);
      pe.zoomOut = Flowtime.showOverview.bind(Flowtime, true);
      pe.last = Flowtime.gotoEnd;
      pe.first = Flowtime.gotoHome;
    }

    if (pe.info.name === 'fathom' && !pe.info.version) {
      var $root = $('.slide').parent();
      var sendKeyPress = function(code) {
        var e = jQuery.Event("keydown");
        e.which = e.keyCode = code;
        $root.trigger(e);
      };
      pe.next = sendKeyPress.bind(null, 39);
      pe.prev = sendKeyPress.bind(null, 37);
      pe.zoomIn = function() {};
      pe.zoomOut = function() {};
      pe.last = function() {};
      pe.first = function() {};
    }

    if (pe.info.name === 'bespoke' && !pe.info.version) {
      pe.next = bespoke.next;
      pe.prev = bespoke.prev;
      pe.zoomIn = function() {};
      pe.zoomOut = function() {};
      pe.last = function() {};
      pe.first = function() {};
    }

    if (pe.info.name === 'impress' && !pe.info.version) {
      console.log('impressed');
      var steps = document.getElementsByClassName('step');
      if (!steps.length) return;
      var lastSlide = document.getElementsByClassName('step').length - 2;
      var zoomedOutFrom = undefined;
      resetZoomAndDo = function(func) {return function() { zoomedOutFrom = undefined; return func(); }};
      pe.next = resetZoomAndDo(impress().next);
      pe.prev = resetZoomAndDo(impress().prev);
      pe.zoomIn = function() {
        if (zoomedOutFrom) {
          impress().goto(zoomedOutFrom);
          zoomedOutFrom = undefined;
        }
      };
      pe.zoomOut = function() {
        current = document.getElementsByClassName('step present');
        if (current.length && current[0].id !== 'overview' ) {
          zoomedOutFrom = current[0];
          impress().goto(-1);
        }
      };
      pe.last = resetZoomAndDo(impress().goto.bind(null, lastSlide));
      pe.first = resetZoomAndDo(impress().goto.bind(null, 0));
    }

    if (pe.info.name === 'jmpress' && !pe.info.version) {
      var $root = $('.jmpress');
      pe.next = function() {return $root.jmpress('next');};
      pe.prev = function() {return $root.jmpress('prev');};
      pe.first = function() {return $root.jmpress('home');};
      pe.last = function() {return $root.jmpress('end');};
      pe.zoomIn = function() {return $root.jmpress('zoomIn');};
      pe.zoomOut = function() {return $root.jmpress('zoomOut');};
    }
  }

  fillPolyFill();

  window.addEventListener('message', function(event) {
    if (event.data === 'nexty-get-engine') return window.parent.postMessage(pe.info, '*');
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

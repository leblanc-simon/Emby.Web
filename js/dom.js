(function (globalScope) {

    function parentWithClass(elem, className) {

        while (!elem.classList || !elem.classList.contains(className)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
        }

        return elem;
    }

    /**
   * Copyright 2012, Digital Fusion
   * Licensed under the MIT license.
   * http://teamdf.com/jquery-plugins/license/
   *
   * @author Sam Sehnert
   * @desc A small plugin that checks whether elements are within
   *       the user visible viewport of a web browser.
   *       only accounts for vertical position, not horizontal.
   */
    function visibleInViewport(elem, partial, thresholdX, thresholdY) {

        thresholdX = thresholdX || 0;
        thresholdY = thresholdY || 0;

        var vpWidth = window.innerWidth,
            vpHeight = window.innerHeight;

        // Use this native browser method, if available.
        var rec = elem.getBoundingClientRect(),
            tViz = rec.top >= 0 && rec.top < vpHeight + thresholdY,
            bViz = rec.bottom > 0 && rec.bottom <= vpHeight + thresholdY,
            lViz = rec.left >= 0 && rec.left < vpWidth + thresholdX,
            rViz = rec.right > 0 && rec.right <= vpWidth + thresholdX,
            vVisible = partial ? tViz || bViz : tViz && bViz,
            hVisible = partial ? lViz || rViz : lViz && rViz;

        return vVisible && hVisible;
    }

    function isInDocument(card) {

        if (document.contains) {
            return document.contains(card);
        }
        return document.body.contains(card);
    }

    var enableWebComponents;
    function supportsWebComponents() {

        if (enableWebComponents == null) {
            enableWebComponents = ('registerElement' in document && 'content' in document.createElement('template'));
        }
        return enableWebComponents;
    }

    document.addEventListener('WebComponentsReady', function () {
        enableWebComponents = true;
    });

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.Dom = {
        isInDocument: isInDocument,
        visibleInViewport: visibleInViewport,
        parentWithClass: parentWithClass,
        supportsWebComponents: supportsWebComponents
    };

})(this);

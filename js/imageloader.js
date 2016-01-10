(function (globalScope) {

    var thresholdX = screen.availWidth;
    var thresholdY = screen.availHeight;
    thresholdX = 0;
    thresholdY = 0;
    var wheelEvent = (document.implementation.hasFeature('Event.wheel', '3.0') ? 'wheel' : 'mousewheel');

    function isVisible(elem) {
        return Emby.Dom.visibleInViewport(elem, true, thresholdX, thresholdY);
    }

    function fillImage(elem) {
        var source = elem.getAttribute('data-src');
        if (source) {
            ImageStore.setImageInto(elem, source);
            elem.setAttribute("data-src", '');
        }
    }

    function cancelAll(tokens) {
        for (var i = 0, length = tokens.length; i < length; i++) {

            tokens[i] = true;
        }
    }

    function unveilElements(images) {

        if (!images.length) {
            return;
        }

        var cancellationTokens = [];
        function unveilInternal(tokenIndex) {

            var remaining = [];
            var anyFound = false;
            var out = false;

            // TODO: This out construct assumes left to right, top to bottom

            for (var i = 0, length = images.length; i < length; i++) {

                if (cancellationTokens[tokenIndex]) {
                    console.log('cancel! ' + new Date().getTime());
                    return;
                }
                var img = images[i];
                if (!out && isVisible(img)) {
                    anyFound = true;
                    fillImage(img);
                } else {

                    if (anyFound) {
                        out = true;
                    }
                    remaining.push(img);
                }
            }

            images = remaining;

            if (!images.length) {
                document.removeEventListener('focus', unveil, true);
                document.removeEventListener('scroll', unveil, true);
                document.removeEventListener(wheelEvent, unveil, true);
                window.removeEventListener('resize', unveil, true);
            }
        }

        function unveil() {

            cancelAll(cancellationTokens);

            var index = cancellationTokens.length;
            cancellationTokens.length++;

            setTimeout(function () {
                unveilInternal(index);
            }, 0);
        }

        document.addEventListener('scroll', unveil, true);
        document.addEventListener('focus', unveil, true);
        document.addEventListener(wheelEvent, unveil, true);
        window.addEventListener('resize', unveil, true);

        unveil();
    }

    function fillImages(elems) {

        for (var i = 0, length = elems.length; i < length; i++) {
            var elem = elems[0];
            var source = elem.getAttribute('data-src');
            if (source) {
                ImageStore.setImageInto(elem, source);
                elem.setAttribute("data-src", '');
            }
        }
    }

    function lazyChildren(elem) {

        unveilElements(elem.getElementsByClassName('lazy'));
    }

    function lazyImage(elem, url) {

        elem.setAttribute('data-src', url);
        fillImages([elem]);
    }

    function getPrimaryImageAspectRatio(items) {

        var values = [];

        for (var i = 0, length = items.length; i < length; i++) {

            var ratio = items[i].PrimaryImageAspectRatio || 0;

            if (!ratio) {
                continue;
            }

            values[values.length] = ratio;
        }

        if (!values.length) {
            return null;
        }

        // Use the median
        values.sort(function (a, b) { return a - b; });

        var half = Math.floor(values.length / 2);

        var result;

        if (values.length % 2)
            result = values[half];
        else
            result = (values[half - 1] + values[half]) / 2.0;

        // If really close to 2:3 (poster image), just return 2:3
        if (Math.abs(0.66666666667 - result) <= .15) {
            return 0.66666666667;
        }

        // If really close to 16:9 (episode image), just return 16:9
        if (Math.abs(1.777777778 - result) <= .2) {
            return 1.777777778;
        }

        // If really close to 1 (square image), just return 1
        if (Math.abs(1 - result) <= .15) {
            return 1;
        }

        // If really close to 4:3 (poster image), just return 2:3
        if (Math.abs(1.33333333333 - result) <= .15) {
            return 1.33333333333;
        }

        return result;
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ImageLoader = {
        lazyChildren: lazyChildren,
        getPrimaryImageAspectRatio: getPrimaryImageAspectRatio
    };

})(this);

(function () {

    //var worker = new Worker("js/imageloaderworker.js");

    //var callbacks = {};

    //worker.onmessage = function (event) {

    //    var data = event.data.split('|');
    //    var callback = callbacks[data[0]];

    //    if (callback) {
    //        callback(data[1]);
    //    }
    //}

    function setImageIntoElement(elem, url) {

        //url += "&dt=" + new Date().getTime();

        //worker.postMessage(url);

        //callbacks[url] = function (blobUrl) {

        //    callbacks[url] = null;

        //    if (elem.tagName !== "IMG") {
        //        elem.style.backgroundImage = "url('" + blobUrl + "')";
        //    } else {
        //        elem.setAttribute("src", blobUrl);
        //    }
        //};

        if (elem.tagName !== "IMG") {

            var tmp = new Image();

            tmp.onload = function () {

                elem.style.backgroundImage = "url('" + url + "')";
            };
            tmp.src = url;


        } else {
            elem.setAttribute("src", url);
        }

        //fadeIn(elem, 1);
    }

    function fadeIn(elem, iterations) {

        var keyframes = [
          { opacity: '0', offset: 0 },
          { opacity: '1', offset: 1 }];
        var timing = { duration: 200, iterations: iterations };
        return elem.animate(keyframes, timing);
    }

    function simpleImageStore() {

        var self = this;

        self.setImageInto = setImageIntoElement;
    }

    console.log('creating simpleImageStore');
    window.ImageStore = new simpleImageStore();

    if (navigator.webkitPersistentStorage) {
        require(['js/imagestore']);
    }

})();
(function (globalScope, document) {

    var lastInputTime = new Date().getTime();
    var lastMouseInputTime = new Date().getTime();
    var isMouseIdle;

    function idleTime() {
        return new Date().getTime() - lastInputTime;
    }

    function mouseIdleTime() {
        return new Date().getTime() - lastMouseInputTime;
    }

    document.addEventListener('click', function () {
        lastInputTime = new Date().getTime();
    });

    var lastMouseMoveData = {
        x: 0,
        y: 0
    };

    document.addEventListener('mousemove', function (e) {

        var obj = lastMouseMoveData;

        var eventX = e.screenX;
        var eventY = e.screenY;

        // if coord don't exist how could it move
        if (typeof eventX === "undefined" && typeof eventY === "undefined") {
            return;
        }

        // if coord are same, it didn't move
        if (Math.abs(eventX - obj.x) < 10 && Math.abs(eventY - obj.y) < 10) {
            return;
        }

        obj.x = eventX;
        obj.y = eventY;

        lastInputTime = lastMouseInputTime = new Date().getTime();

        if (isMouseIdle) {
            isMouseIdle = false;
            document.body.classList.remove('mouseIdle');
        }
    });

    document.addEventListener('keydown', function (evt) {
        lastInputTime = new Date().getTime();

        onKeyDown(evt);

    });

    function hasBuiltInKeyboard() {

        // This is going to be really difficult to get right
        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('xbox') != -1) {
            return true;
        }

        if (userAgent.indexOf('mobile') != -1) {
            return true;
        }

        if (userAgent.indexOf('tv') != -1) {
            return true;
        }

        if (userAgent.indexOf('samsung') != -1) {
            return true;
        }

        if (userAgent.indexOf('nintendo') != -1) {
            return true;
        }

        return false;
    }

    if (!hasBuiltInKeyboard()) {
        document.addEventListener('focus', function (evt) {

            var tag = evt.target.tagName;

            if ((evt.target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA')) {

                var keyboard = getKeyboard();

                if (keyboard) {

                    keyboard.show(evt.target);
                    evt.stopPropagation();
                    evt.preventDefault();
                    return false;
                }
            }

        }, true);
    }

    function onKeyDown(evt) {

        switch (evt.keyCode) {

            case 37:
                // left
                evt.preventDefault();
                evt.stopPropagation();
                nav(evt, 0);
                break;
            case 38:
                // up
                evt.preventDefault();
                evt.stopPropagation();
                nav(evt, 2);
                break;
            case 39:
                // right
                evt.preventDefault();
                evt.stopPropagation();
                nav(evt, 1);
                break;
            case 40:
                // down
                evt.preventDefault();
                evt.stopPropagation();
                nav(evt, 3);
                break;
        }
    }

    function getOffset(elem, doc) {

        var box = { top: 0, left: 0 };

        if (!doc) {
            return box;
        }

        var docElem = doc.documentElement;

        // Support: BlackBerry 5, iOS 3 (original iPhone)
        // If we don't have gBCR, just use 0,0 rather than error
        if (elem.getBoundingClientRect) {
            box = elem.getBoundingClientRect();
        }
        var win = doc.defaultView;
        return {
            top: box.top + win.pageYOffset - docElem.clientTop,
            left: box.left + win.pageXOffset - docElem.clientLeft
        };
    }

    function getViewportBoundingClientRect(elem) {

        var doc = elem.ownerDocument;
        var offset = getOffset(elem, doc);
        var win = doc.defaultView;

        var posY = offset.top - win.pageXOffset;
        var posX = offset.left - win.pageYOffset;

        var width = elem.offsetWidth;
        var height = elem.offsetHeight;

        return {
            left: posX,
            top: posY,
            width: width,
            height: height,
            right: posX + width,
            bottom: posY + height
        };
        var scrollLeft = (((t = document.documentElement) || (t = document.body.parentNode))
            && typeof t.scrollLeft == 'number' ? t : document.body).scrollLeft;

        var scrollTop = (((t = document.documentElement) || (t = document.body.parentNode))
            && typeof t.scrollTop == 'number' ? t : document.body).scrollTop;
    }

    function nav(evt, direction) {

        require(['nearestElements'], function (nearestElements, soundeffects) {

            var activeElement = document.activeElement;

            if (activeElement) {
                activeElement = Emby.FocusManager.focusableParent(activeElement);
            }

            var container = activeElement ? Emby.FocusManager.getFocusContainer(activeElement) : document.body;
            var focusable = Emby.FocusManager.getFocusableElements(container);

            if (!activeElement) {
                if (focusable.length) {
                    focusElement(evt.target, focusable[0]);
                }
                return;
            }

            var rect = getViewportBoundingClientRect(activeElement);
            var focusableElements = [];

            for (var i = 0, length = focusable.length; i < length; i++) {
                var curr = focusable[i];
                if (curr != activeElement) {

                    var elementRect = getViewportBoundingClientRect(curr);

                    switch (direction) {

                        case 0:
                            // left
                            if (elementRect.left >= rect.left) {
                                continue;
                            }
                            if (elementRect.right == rect.right) {
                                continue;
                            }
                            if (elementRect.right > rect.left + 10) {
                                continue;
                            }
                            break;
                        case 1:
                            // right
                            if (elementRect.right <= rect.right) {
                                continue;
                            }
                            if (elementRect.left == rect.left) {
                                continue;
                            }
                            if (elementRect.left < rect.right - 10) {
                                continue;
                            }
                            break;
                        case 2:
                            // up
                            if (elementRect.top >= rect.top) {
                                continue;
                            }
                            if (elementRect.bottom >= rect.bottom) {
                                continue;
                            }
                            break;
                        case 3:
                            // down
                            if (elementRect.bottom <= rect.bottom) {
                                continue;
                            }
                            if (elementRect.top <= rect.top) {
                                continue;
                            }
                            break;
                        default:
                            break;
                    }
                    focusableElements.push({
                        element: curr,
                        clientRect: elementRect
                    });
                }
            }

            var nearest = window.nearest(focusableElements, {

                x: rect.left + rect.width / 2, // X position of top left corner of point/region
                y: rect.top + rect.height / 2, // Y position of top left corner of point/region
                w: 0, // Width of region
                h: 0, // Height of region
                tolerance: 1, // Distance tolerance in pixels, mainly to handle fractional pixel rounding bugs
                container: document, // Container of objects for calculating %-based dimensions
                includeSelf: false, // Include 'this' in search results (t/f) - only applies to $(elem).func(selector) syntax
                onlyX: false, // Only check X axis variations (t/f)
                onlyY: false // Only check Y axis variations (t/f)

            });

            if (nearest.length) {
                focusElement(evt.target, nearest[0]);
            }
        });
    }

    function focusElement(originalElement, elem) {

        var scrollSlider = Emby.Dom.parentWithClass(elem, 'scrollSlider');

        if (scrollSlider && scrollSlider != Emby.Dom.parentWithClass(originalElement, 'scrollSlider')) {

            var selected = scrollSlider.querySelector('.selected');

            if (selected) {
                Emby.FocusManager.focus(selected);
                return;
            }
        }

        Emby.FocusManager.focus(elem);
    }

    setInterval(function () {

        if (mouseIdleTime() >= 5000) {
            isMouseIdle = true;
            document.body.classList.add('mouseIdle');
        }

    }, 5000);

    function getKeyboard() {
        return Emby.PluginManager.ofType('keyboard')[0];
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.InputManager = {
        idleTime: idleTime
    };

})(this, document);

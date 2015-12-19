(function (globalScope, document) {

    function autoFocus(view, defaultToFirst) {

        var element = view.querySelector('*[autofocus]');
        if (element) {
            focus(element);
        } else if (defaultToFirst) {
            element = getFocusableElements(view)[0];

            if (element) {
                focus(element);
            }
        }
    }

    function focus(element) {

        if (element.tagName == 'PAPER-INPUT') {
            element = element.querySelector('input');
        }

        element.focus();
    }

    var focusableTagNames = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'PAPER-BUTTON', 'PAPER-INPUT', 'PAPER-TEXTAREA', 'PAPER-ICON-BUTTON', 'PAPER-FAB', 'PAPER-ICON-ITEM', 'PAPER-MENU-ITEM'];
    var focusableContainerTagNames = ['BODY', 'PAPER-DIALOG'];
    var focusableQuery = focusableTagNames.join(',') + ',.focusable';

    function isFocusable(elem) {

        if (focusableTagNames.indexOf(elem.tagName) != -1) {
            return true;
        }

        if (elem.classList && elem.classList.contains('focusable')) {
            return true;
        }

        return false;
    }

    function focusableParent(elem) {

        while (!isFocusable(elem)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
        }

        return elem;
    }

    function getFocusableElements(parent) {
        var elems = (parent || document).querySelectorAll(focusableQuery);
        var focusableElements = [];

        for (var i = 0, length = elems.length; i < length; i++) {

            var elem = elems[i];

            if (elem.disabled) {
                continue;
            }

            if (elem.getAttribute('tabindex') == "-1") {
                continue;
            }

            // http://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
            if (elem.offsetParent === null) {
                continue;
            }

            focusableElements.push(elem);
        }

        return focusableElements;
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    function isFocusContainer(elem, direction) {

        if (focusableContainerTagNames.indexOf(elem.tagName) != -1) {
            return true;
        }

        if (direction < 2) {
            if (elem.classList.contains('focuscontainer-x')) {
                return true;
            }
        }
        else if (direction == 3) {
            if (elem.classList.contains('focuscontainer-down')) {
                return true;
            }
        }

        return false;
    }

    function getFocusContainer(elem, direction) {
        while (!isFocusContainer(elem, direction)) {
            elem = elem.parentNode;

            if (!elem) {
                return document.body;
            }
        }

        return elem;
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

    function nav(activeElement, direction) {

        activeElement = activeElement || document.activeElement;

        if (activeElement) {
            activeElement = focusableParent(activeElement);
        }

        var container = activeElement ? getFocusContainer(activeElement, direction) : document.body;
        var focusable = getFocusableElements(container);

        if (!activeElement) {
            if (focusable.length) {
                focus(focusable[0]);
            }
            return;
        }

        var focusableContainer = Emby.Dom.parentWithClass(activeElement, 'focusable');

        var rect = getViewportBoundingClientRect(activeElement);
        var focusableElements = [];

        for (var i = 0, length = focusable.length; i < length; i++) {
            var curr = focusable[i];

            if (curr == activeElement) {
                continue;
            }
            // Don't refocus into the same container
            if (curr == focusableContainer) {
                continue;
            }

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
                        //continue;
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
                        //continue;
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

        var nearest = getNearestElements(focusableElements, rect);

        if (nearest.length) {

            var nearestElement = nearest[0];

            // See if there's a focusable container, and if so, send the focus command to that
            var nearestElementFocusableParent = Emby.Dom.parentWithClass(nearestElement, 'focusable');
            if (nearestElementFocusableParent && nearestElementFocusableParent != nearestElement && activeElement) {
                if (Emby.Dom.parentWithClass(activeElement, 'focusable') != nearestElementFocusableParent) {
                    nearestElement = nearestElementFocusableParent;
                }
            }

            focus(nearestElement);
        }
    }

    function getNearestElements(elementInfos, options) {

        // Get elements and work out x/y points
        var cache = [],
			compDist = Infinity,
			point1x = parseFloat(options.left) || 0,
			point1y = parseFloat(options.top) || 0,
			point2x = parseFloat(point1x + options.width) || point1x,
			point2y = parseFloat(point1y + options.height) || point1y,
			// Shortcuts to help with compression
			min = Math.min,
			max = Math.max;

        var sourceMidX = options.left + (options.width / 2);
        var sourceMidY = options.top + (options.height / 2);

        // Loop through all elements and check their positions
        for (var i = 0, length = elementInfos.length; i < length; i++) {

            var elementInfo = elementInfos[i];
            var elem = elementInfo.element;

            var off = elementInfo.clientRect,
                x = off.left,
                y = off.top,
                w = off.width,
                h = off.height,
                x2 = x + w,
                y2 = y + h,
                maxX1 = max(x, point1x),
                minX2 = min(x2, point2x),
                maxY1 = max(y, point1y),
                minY2 = min(y2, point2y),
                intersectX = minX2 >= maxX1,
                intersectY = minY2 >= maxY1;

            var midX = off.left + (off.width / 2);
            var midY = off.top + (off.height / 2);

            var distX = Math.abs(sourceMidX - midX);
            var distY = Math.abs(sourceMidY - midY);

            var distT = Math.sqrt(distX * distX + distY * distY);

            var isValid = distT <= compDist;
            if (isValid) {
                compDist = min(compDist, distT);
                cache.push({
                    node: elem,
                    dist: distT
                });
            }
        }

        // Make sure all cached items are within tolerance range
        var len = cache.length,
			filtered = [];

        var compMin = compDist;
        var compMax = compDist;

        for (var i = 0; i < len; i++) {
            var item = cache[i];
            if (item.dist >= compMin && item.dist <= compMax) {
                filtered.push(item.node);
            }
        }

        return filtered;
    }

    globalScope.Emby.FocusManager = {
        autoFocus: autoFocus,
        focus: focus,
        focusableParent: focusableParent,
        getFocusableElements: getFocusableElements,
        moveLeft: function (sourceElement) {
            nav(sourceElement, 0);
        },
        moveRight: function (sourceElement) {
            nav(sourceElement, 1);
        },
        moveUp: function (sourceElement) {
            nav(sourceElement, 2);
        },
        moveDown: function (sourceElement) {
            nav(sourceElement, 3);
        }
    };

})(this, document);

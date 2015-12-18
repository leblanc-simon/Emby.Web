/**
 * Method signatures:
 *
 * $.nearest({x, y}, selector) - find $(selector) closest to point
 * $(elem).nearest(selector) - find $(selector) closest to elem
 * $(elemSet).nearest({x, y}) - filter $(elemSet) and return closest to point
 *
 * Also:
 * $.furthest()
 * $(elem).furthest()
 *
 * $.touching()
 * $(elem).touching()
 */
; (function ($) {

    function nearest(elementInfos, options) {

        // Get elements and work out x/y points
        var cache = [],
			compDist = Infinity,
			point1x = parseFloat(options.x) || 0,
			point1y = parseFloat(options.y) || 0,
			point2x = parseFloat(point1x + options.w) || point1x,
			point2y = parseFloat(point1y + options.h) || point1y,
			tolerance = parseFloat(options.tolerance) || 0,
			// Shortcuts to help with compression
			min = Math.min,
			max = Math.max;

        if (tolerance < 0) {
            tolerance = 0;
        }

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
                intersectY = minY2 >= maxY1,
                distX, distY, distT, isValid;

            distX = intersectX ? 0 : maxX1 - minX2;
            distY = intersectY ? 0 : maxY1 - minY2;

            distT = intersectX || intersectY ?
                max(distX, distY) :
                Math.sqrt(distX * distX + distY * distY);

            isValid = distT <= compDist + tolerance;
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
			filtered = [],
			compMin, compMax,
			i, item;
        if (len) {

            compMin = compDist;
            compMax = compDist + tolerance;

            for (i = 0; i < len; i++) {
                item = cache[i];
                if (item.dist >= compMin && item.dist <= compMax) {
                    filtered.push(item.node);
                }
            }
        }
        return filtered;
    }

    window.nearest = nearest;

})();

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

    window.nearest = nearest;

})();

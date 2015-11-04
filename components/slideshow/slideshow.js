define(['paperdialoghelper', 'css!components/slideshow/style'], function (paperdialoghelper) {

    function createElements() {

        var elem = document.querySelector('.slideshowDialog');

        if (elem) {
            return elem;
        }

        var dlg = paperdialoghelper.createDialog({
            exitAnimationDuration: 1000
        });

        dlg.classList.add('slideshowDialog');

        var html = '';
        html += '<div class="dialogContent">';
        html += '<div class="slideshowImage"></div><h1 class="slideshowImageText"></h1>';
        html += '</div>';

        dlg.innerHTML = html;

        // Has to be assigned a z-index after the call to .open() 
        dlg.addEventListener('iron-overlay-closed', function (e) {

            stopInterval();
            this.parentNode.removeChild(this);
        });

        document.body.appendChild(dlg);

        paperdialoghelper.open(dlg);

        return dlg;
    }

    var currentInterval;
    function startInterval(options) {

        var items = options.items;

        stopInterval();
        createElements();

        var index = options.startIndex || 0;
        showNextImage(items, index, false, (options.interval || 6000), options);
    }

    function showNextImage(items, index, preload, interval, options) {

        var item = items[index];
        var imgUrl;

        if (item.BackdropImageTags && item.BackdropImageTags.length) {
            imgUrl = Emby.Models.backdropImageUrl(item, {
                maxWidth: screen.availWidth
            });
        } else {
            imgUrl = Emby.Models.imageUrl(item, {
                type: "Primary",
                maxWidth: screen.availWidth
            });
        }

        var onSrcLoaded = function () {
            var cardImageContainer = document.querySelector('.slideshowImage');

            var newCardImageContainer = document.createElement('div');
            newCardImageContainer.className = cardImageContainer.className;

            if (options.cover) {
                newCardImageContainer.classList.add('cover');
            }

            newCardImageContainer.style.backgroundImage = "url('" + imgUrl + "')";
            newCardImageContainer.classList.add('hide');
            cardImageContainer.parentNode.appendChild(newCardImageContainer);

            if (options.showTitle) {
                document.querySelector('.slideshowImageText').innerHTML = item.Name;
            } else {
                document.querySelector('.slideshowImageText').innerHTML = '';
            }

            newCardImageContainer.classList.remove('hide');
            var onAnimationFinished = function () {

                var parentNode = cardImageContainer.parentNode;
                if (parentNode) {
                    parentNode.removeChild(cardImageContainer);
                }
            };

            if (newCardImageContainer.animate) {

                var keyframes = [
                        { opacity: '0', offset: 0 },
                        { opacity: '1', offset: 1 }];
                var timing = { duration: 1200, iterations: 1 };
                newCardImageContainer.animate(keyframes, timing).onfinish = onAnimationFinished;
            } else {
                onAnimationFinished();
            }

            currentInterval = setTimeout(function() {
                showNextImage(items, index + 1, true, interval, options);
            }, interval);
        };

        if (preload) {
            var img = new Image();
            img.onload = onSrcLoaded;
            img.src = imgUrl;
        } else {
            onSrcLoaded();
        }
    }

    function stopInterval() {
        if (currentInterval) {
            clearTimeout(currentInterval);
            currentInterval = null;
        }
    }

    function slideshow(options) {

        var self = this;

        self.show = function () {
            startInterval(options);
        };

        self.hide = function () {

            var dlg = document.querySelector('.slideshowDialog');
            if (dlg) {

                paperdialoghelper.close(dlg);
            }
        };
    }

    return slideshow;
});
define([], function () {

    function focusHandler(options) {

        var self = this;

        var parent = options.parent;
        var focusedElement;
        var zoomElement;
        var currentAnimation;
        var zoomScale = '1.20';
        var zoomEase = 'linear';
        var zoomDuration = 200;
        var lastFocus = 0;

        parent.addEventListener('focus', onFocusIn, true);
        parent.addEventListener('blur', onFocusOut, true);

        var selectedItemInfoInner = options.selectedItemInfoInner;
        var selectedIndexElement = options.selectedIndexElement;

        function onFocusIn(e) {
            var focused = Emby.FocusManager.focusableParent(e.target);
            focusedElement = focused;

            if (focused) {

                if (selectedIndexElement) {
                    var index = focused.getAttribute('data-index');
                    if (index) {
                        selectedIndexElement.innerHTML = 1 + parseInt(index);
                    }
                }

                var now = new Date().getTime();

                var threshold = options.animateFocus ? 50 : 50;
                var animate = (now - lastFocus) > threshold;
                options.slyFrame.toCenter(focused, !animate);
                lastFocus = now;
                startZoomTimer();
            }
        }

        function onFocusOut(e) {
            selectedItemInfoInner.innerHTML = '';

            var focused = focusedElement;
            focusedElement = null;

            var zoomed = zoomElement;
            zoomElement = null;

            if (zoomed) {
                zoomOut(zoomed);
            }

            if (currentAnimation) {
                currentAnimation.cancel();
                currentAnimation = null;
            }
        }

        var zoomTimeout;
        var selectedMediaInfoTimeout;
        function startZoomTimer() {

            if (zoomTimeout) {
                clearTimeout(zoomTimeout);
            }
            zoomTimeout = setTimeout(onZoomTimeout, 100);
            if (selectedMediaInfoTimeout) {
                clearTimeout(selectedMediaInfoTimeout);
            }
            selectedMediaInfoTimeout = setTimeout(onSelectedMediaInfoTimeout, 1200);
        }

        function onZoomTimeout() {
            var focused = focusedElement
            if (focused && document.activeElement == focused) {
                zoomIn(focused);
            }
        }

        function onSelectedMediaInfoTimeout() {
            var focused = focusedElement
            if (focused && document.activeElement == focused) {
                setSelectedItemInfo(focused);
            }
        }

        function zoomIn(elem) {

            if (elem.classList.contains('noScale')) {
                return;
            }

            var card = elem;

            if (document.activeElement != card) {
                return;
            }

            var cardBox = card.querySelector('.cardBox');

            if (!cardBox) {
                return;
            }

            elem = cardBox;

            var keyframes = [
                { transform: 'scale(1)  ', offset: 0 },
              { transform: 'scale(' + zoomScale + ')', offset: 1 }
            ];

            if (currentAnimation) {
                currentAnimation.cancel();
            }

            var onAnimationFinished = function () {
                zoomElement = elem;
                currentAnimation = null;
            };

            if (elem.animate) {
                var timing = { duration: zoomDuration, iterations: 1, fill: 'forwards', easing: zoomEase };
                var animation = elem.animate(keyframes, timing);

                animation.onfinish = onAnimationFinished;
                currentAnimation = animation;
            } else {
                onAnimationFinished();
            }
        }

        function setSelectedItemInfo(card) {

            var id = card.getAttribute('data-id');

            if (!id) {
                return;
            }

            Emby.Models.item(id).then(function (item) {
                Emby.Backdrop.setBackdrops([item]);
                setSelectedInfo(card, item);
            });
        }

        function setSelectedInfo(card, item) {

            var html = '';

            html += '<div>';
            html += DefaultTheme.CardBuilder.getDisplayName(item);
            html += '</div>';

            if (item.AlbumArtist) {
                html += '<div class="selectedItemSecondaryInfo">';
                html += item.AlbumArtist;
                html += '</div>';
            } 

            var mediaInfo = DefaultTheme.CardBuilder.getMediaInfoHtml(item);

            if (mediaInfo) {
                html += '<div class="selectedItemSecondaryInfo">';
                html += mediaInfo;
                html += '</div>';
            }

            if (item.Overview) {
                html += '<div class="selectedItemSecondaryInfo">';
                html += item.Overview;
                html += '</div>';
            }

            var logoImageUrl = Emby.Models.logoImageUrl(item, {
            });

            if (logoImageUrl) {
                selectedItemInfoInner.classList.add('selectedItemInfoInnerWithLogo');

                html += '<div class="selectedItemInfoLogo" style="background-image:url(\'' + logoImageUrl + '\');"></div>';

            } else {
                selectedItemInfoInner.classList.remove('selectedItemInfoInnerWithLogo');
            }

            selectedItemInfoInner.innerHTML = html;

            if (html) {
                fadeIn(selectedItemInfoInner, 1);
            }
        }

        function zoomOut(elem) {

            var keyframes = [
            { transform: 'scale(' + zoomScale + ')  ', offset: 0 },
            { transform: 'scale(1)', offset: 1 }
            ];

            if (elem.animate) {
                var timing = { duration: zoomDuration, iterations: 1, fill: 'forwards', easing: zoomEase };
                elem.animate(keyframes, timing);
            }
        }

        function fadeIn(elem, iterations) {

            var keyframes = [
              { opacity: '0', offset: 0 },
              { opacity: '1', offset: 1 }];
            var timing = { duration: 300, iterations: iterations };
            return elem.animate(keyframes, timing);
        }

        self.destroy = function() {

            parent.addEventListener('focus', onFocusIn, true);
            parent.addEventListener('blur', onFocusOut, true);
        };
    }

    return focusHandler;
});
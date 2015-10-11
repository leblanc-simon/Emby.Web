define([], function () {

    return function () {

        var self = this;

        self.name = 'Backdrop ScreenSaver';
        self.type = 'screensaver';
        self.packageName = 'backdropscreensaver';
        self.supportsAnonymous = false;

        function createElements() {

            var elem = document.querySelector('.slideshowContainer');

            if (elem) {
                return elem;
            }

            elem = document.createElement('div');
            elem.classList.add('slideshowContainer');

            var html = '';

            html += '<div class="slideshowImage"></div><h1 class="slideshowImageText"></h1>';

            elem.innerHTML = html;

            document.body.appendChild(elem);
        }

        function start(options) {

            var query = {
                ImageTypes: "Backdrop",
                EnableImageTypes: "Backdrop",
                IncludeItemTypes: "Movie,Series,MusicArtist,Game",
                SortBy: "Random",
                Recursive: true,
                Fields: "Taglines",
                ImageTypeLimit: 1,
                StartIndex: 0,
                Limit: 200
            };

            Emby.Models.items(query).then(function (result) {

                if (result.Items.length) {
                    createElements();

                    startInterval(result.Items, options);
                }
            });
        }

        function showItemImage(item, delay, options) {

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

            var cardImageContainer = document.querySelector('.slideshowImage');

            var newCardImageContainer = document.createElement('div');
            newCardImageContainer.className = cardImageContainer.className;

            if (options.cover) {
                newCardImageContainer.classList.add('cover');
            }

            newCardImageContainer.style.backgroundImage = "url('" + imgUrl + "')";
            newCardImageContainer.classList.add('hide');
            cardImageContainer.parentNode.appendChild(newCardImageContainer);

            animateTimeout = setTimeout(function () {
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

            }, delay);
        }

        var currentInterval;
        var animateTimeout;
        function startInterval(items, options) {

            stopInterval();

            var index = 0;

            var changeImage = function () {

                if (index >= items.length) {
                    index = 0;
                }

                var delay = index == 0 ? 0 : 2000;

                showItemImage(items[index], delay, options);
                index++;

            };

            currentInterval = setInterval(changeImage, 8000);

            changeImage();
        }

        function stopInterval() {
            if (currentInterval) {
                clearInterval(currentInterval);
                currentInterval = null;
            }
            if (animateTimeout) {
                clearTimeout(animateTimeout);
                animateTimeout = null;
            }
        }

        self.show = function () {

            require(['css!' + Emby.PluginManager.mapRequire(self, 'style.css')], function () {

                start({
                    showTitle: true,
                    cover: true
                });
            });
        };

        function fadeOut(elem, iterations) {
            var keyframes = [
              { opacity: '1', offset: 0 },
              { opacity: '0', offset: 1 }];
            var timing = { duration: 900, iterations: iterations };
            return elem.animate(keyframes, timing);
        }

        self.hide = function () {

            stopInterval();

            var elem = document.querySelector('.slideshowContainer');

            if (elem) {

                var onAnimationFinish = function () {
                    elem.parentNode.removeChild(elem);
                };

                if (elem.animate) {
                    var animation = fadeOut(elem, 1);
                    animation.onfinish = onAnimationFinish;
                } else {
                    onAnimationFinish();
                }
            }
        };
    }
});
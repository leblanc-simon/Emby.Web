(function () {

    document.addEventListener("viewinit-defaulttheme-videoosd", function (e) {

        new nowPlayingPage(e.target, e.detail.params);
    });

    function nowPlayingPage(view, params) {

        var self = this;

        function getHeaderElement() {
            return document.querySelector('.themeHeader');
        }

        function setTitle(item) {

            var url = Emby.Models.logoImageUrl(item, {});

            if (url) {

                var pageTitle = document.querySelector('.pageTitle');
                pageTitle.style.backgroundImage = "url('" + url + "')";
                pageTitle.classList.add('pageTitleWithLogo');
                pageTitle.innerHTML = '';
                document.querySelector('.headerLogo').classList.add('hide');
            } else {
                Emby.Page.setTitle('');
            }
        }

        function setCurrentItem(item) {

            if (item) {
                setTitle(item);

            } else {

                Emby.Page.setTitle('');
            }
        }

        function showOsd() {

            slideDownToShow(getHeaderElement());
            startHideTimer();
        }

        function hideOsd() {

            slideUpToHide(getHeaderElement());
        }

        var hideTimeout;
        function startHideTimer() {
            stopHideTimer();
            hideTimeout = setTimeout(hideOsd, 4000);
        }
        function stopHideTimer() {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
        }

        function slideDownToShow(elem) {

            if (!elem.classList.contains('hide')) {
                return;
            }

            elem.classList.remove('hide');

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,-' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 0 },
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing);
            });
        }

        function slideUpToHide(elem) {

            if (elem.classList.contains('hide')) {
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 0 },
                  { transform: 'translate3d(0,-' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing).onfinish = function () {
                    elem.classList.add('hide');
                };
            });
        }

        var lastMouseMoveData = {
            x: 0,
            y: 0
        };
        function onMouseMove(e) {
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

            showOsd();
        }

        function onInputCommand(e, data) {

            switch (data.command) {

                case 'up':
                case 'down':
                case 'left':
                case 'right':
                case 'select':
                case 'menu':
                case 'info':
                case 'play':
                case 'playpause':
                case 'fastforward':
                case 'rewind':
                    showOsd();
                    break;
                default:
                    break;
            }
        }

        function onPlaybackStart(e, player) {

            //bindToPlayer(player);
            setCurrentItem(Emby.PlaybackManager.currentItem(player));

            enableStopOnBack(true);
        }

        function onPlaybackStop(e, stopInfo) {

            //releasePlayer();
            setCurrentItem(null);

            if (stopInfo.nextMediaType != 'Video') {
                Emby.Page.back();
            }
        }

        view.addEventListener('viewbeforeshow', function (e) {

            getHeaderElement().classList.add('osdHeader');
        });

        view.addEventListener('viewshow', function (e) {

            Events.on(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.on(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);

            onPlaybackStart(e, Emby.PlaybackManager.currentPlayer());
            document.addEventListener('mousemove', onMouseMove);

            showOsd();

            require(['inputmanager'], function (inputmanager) {
                inputmanager.on(onInputCommand);
            });
        });

        view.addEventListener('viewbeforehide', function () {

            stopHideTimer();
            getHeaderElement().classList.remove('osdHeader');
            document.removeEventListener('mousemove', onMouseMove);
            Events.off(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);

            require(['inputmanager'], function (inputmanager) {
                inputmanager.off(onInputCommand);
            });
        });

        view.addEventListener('viewhide', function () {

            getHeaderElement().classList.remove('hide');
        });

        function onViewHideStopPlayback() {

            if (Emby.PlaybackManager.isPlayingVideo()) {

                // Unbind this event so that we don't go back twice
                Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);

                Emby.PlaybackManager.stop();
            }
        }

        function enableStopOnBack(enabled) {

            view.removeEventListener('viewbeforehide', onViewHideStopPlayback);

            if (enabled) {
                if (Emby.PlaybackManager.isPlayingVideo()) {
                    view.addEventListener('viewbeforehide', onViewHideStopPlayback);
                }
            }
        }

    }

})();
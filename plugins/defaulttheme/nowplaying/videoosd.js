(function () {

    document.addEventListener("viewinit-defaulttheme-videoosd", function (e) {

        new nowPlayingPage(e.target, e.detail.params);
    });

    function nowPlayingPage(view, params) {

        var self = this;
        var currentPlayer;

        var nowPlayingVolumeSlider = view.querySelector('.osdVolumeSlider');
        var nowPlayingPositionSlider = view.querySelector('.osdPositionSlider');

        var nowPlayingPositionText = view.querySelector('.osdPositionText');
        var nowPlayingDurationText = view.querySelector('.osdDurationText');

        function getHeaderElement() {
            return document.querySelector('.themeHeader');
        }

        function getOsdBottom() {
            return view.querySelector('.videoOsdBottom');
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

        function setCurrentItem(item, player) {

            setPoster(item);

            if (item) {
                setTitle(item);

                view.querySelector('.osdTitle').innerHTML = DefaultTheme.CardBuilder.getDisplayName(item);
                view.querySelector('.osdMediaInfo').innerHTML = DefaultTheme.CardBuilder.getMediaInfoHtml(item, {
                    runtime: false,
                    subtitles: false,
                    tomatoes: false
                });

                nowPlayingVolumeSlider.disabled = false;
                nowPlayingPositionSlider.disabled = false;

                if (Emby.PlaybackManager.subtitleTracks(player).length) {
                    view.querySelector('.btnSubtitles').classList.remove('hide');
                } else {
                    view.querySelector('.btnSubtitles').classList.add('hide');
                }

                if (Emby.PlaybackManager.audioTracks(player).length > 1) {
                    view.querySelector('.btnAudio').classList.remove('hide');
                } else {
                    view.querySelector('.btnAudio').classList.add('hide');
                }

            } else {

                Emby.Page.setTitle('');
                nowPlayingVolumeSlider.disabled = true;
                nowPlayingPositionSlider.disabled = true;

                view.querySelector('.btnSubtitles').classList.add('hide');
                view.querySelector('.btnAudio').classList.add('hide');

                view.querySelector('.osdTitle').innerHTML = '';
                view.querySelector('.osdMediaInfo').innerHTML = '';
            }

            updatePlaylist();
        }

        function setPoster(item) {

            var osdPoster = view.querySelector('.osdPoster');

            if (item) {

                var imgUrl = Emby.Models.seriesImageUrl(item, { type: 'Primary' }) ||
                    Emby.Models.seriesImageUrl(item, { type: 'Thumb' }) ||
                    Emby.Models.imageUrl(item, { type: 'Primary' });

                if (imgUrl) {
                    osdPoster.innerHTML = '<img src="' + imgUrl + '" />';
                    return;
                }
            }

            osdPoster.innerHTML = '';
        }

        function showOsd() {

            slideDownToShow(getHeaderElement());
            slideUpToShow(getOsdBottom());
            startHideTimer();
        }

        function hideOsd() {

            slideUpToHide(getHeaderElement());
            slideDownToHide(getOsdBottom());
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

        function slideUpToShow(elem) {

            if (!elem.classList.contains('hide')) {
                return;
            }

            elem.classList.remove('hide');

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 0 },
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 1 }];
                var timing = { duration: 300, iterations: 1, easing: 'ease-out' };
                elem.animate(keyframes, timing).onfinish = function () {
                    Emby.FocusManager.autoFocus(elem, true);
                };
            });
        }

        function slideDownToHide(elem) {

            if (elem.classList.contains('hide')) {
                return;
            }

            requestAnimationFrame(function () {

                var keyframes = [
                  { transform: 'translate3d(0,0,0)', opacity: '1', offset: 0 },
                  { transform: 'translate3d(0,' + elem.offsetHeight + 'px,0)', opacity: '.3', offset: 1 }];
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

        function onInputCommand(e) {

            switch (e.detail.command) {

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

            if (player) {
                bindToPlayer(player);
                setCurrentItem(Emby.PlaybackManager.currentItem(player), player);
            } else {
                setCurrentItem(null);
            }

            enableStopOnBack(true);
        }

        function onPlaybackStop(e, stopInfo) {

            releasePlayer();
            setCurrentItem(null);

            if (stopInfo.nextMediaType != 'Video') {
                Emby.Page.back();
            }
        }

        view.addEventListener('viewbeforeshow', function (e) {

            getHeaderElement().classList.add('osdHeader');
            // Make sure the UI is completely transparent
            Emby.Page.setTransparency(Emby.TransparencyLevel.Full);
        });

        view.addEventListener('viewshow', function (e) {

            Events.on(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.on(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);

            onPlaybackStart(e, Emby.PlaybackManager.currentPlayer());
            document.addEventListener('mousemove', onMouseMove);

            showOsd();

            require(['inputmanager'], function (inputmanager) {
                inputmanager.on(window, onInputCommand);
            });
        });

        view.addEventListener('viewbeforehide', function () {
            stopHideTimer();
            getHeaderElement().classList.remove('osdHeader');
            document.removeEventListener('mousemove', onMouseMove);
            Events.off(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);

            require(['inputmanager'], function (inputmanager) {
                inputmanager.off(window, onInputCommand);
            });
        });

        function bindToPlayer(player) {

            if (player != currentPlayer) {

                releasePlayer();

                Events.on(player, 'volumechange', onVolumeChange);
                Events.on(player, 'timeupdate', onTimeUpdate);
                Events.on(player, 'pause', onPlaystateChange);
                Events.on(player, 'playing', onPlaystateChange);
            }

            currentPlayer = player;
            updateVolume(player);
            updateTime(player);
            updatePlaystate(player);
            updatePlaylist();
        }

        function releasePlayer() {

            var player = currentPlayer;

            if (player) {
                Events.off(player, 'volumechange', onVolumeChange);
                Events.off(player, 'timeupdate', onTimeUpdate);
                Events.off(player, 'pause', onPlaystateChange);
                Events.off(player, 'playing', onPlaystateChange);
                currentPlayer = null;
            }
        }

        function onTimeUpdate(e) {
            updateTime(this);
        }

        function onVolumeChange(e) {
            updateVolume(this);
        }

        function onPlaystateChange(e) {
            updatePlaystate(this);
            updatePlaylist();
        }

        function updatePlaystate(player) {

            if (Emby.PlaybackManager.paused()) {
                view.querySelector('.btnPause').icon = 'play-arrow';
            } else {
                view.querySelector('.btnPause').icon = 'pause';
            }
        }

        function updateVolume(player) {

            if (!nowPlayingVolumeSlider.dragging) {
                nowPlayingVolumeSlider.value = Emby.PlaybackManager.volume();
            }

            if (Emby.PlaybackManager.isMuted()) {
                view.querySelector('.buttonMute').icon = 'volume-off';
            } else {
                view.querySelector('.buttonMute').icon = 'volume-up';
            }
        }

        function updatePlaylist() {

            var items = Emby.PlaybackManager.playlist();

            var index = Emby.PlaybackManager.currentPlaylistIndex();

            if (index == 0) {
                view.querySelector('.btnPreviousTrack').disabled = true;
            } else {
                view.querySelector('.btnPreviousTrack').disabled = false;
            }

            if (index >= items.length - 1) {
                view.querySelector('.btnNextTrack').disabled = true;
            } else {
                view.querySelector('.btnNextTrack').disabled = false;
            }
        }

        function updateTime(player) {

            if (!nowPlayingPositionSlider.dragging) {

                var state = Emby.PlaybackManager.getPlayerState(player);
                var playState = state.PlayState || {};
                var nowPlayingItem = state.NowPlayingItem || {};

                if (nowPlayingItem.RunTimeTicks) {

                    var pct = playState.PositionTicks / nowPlayingItem.RunTimeTicks;
                    pct *= 100;

                    nowPlayingPositionSlider.value = pct;

                } else {

                    nowPlayingPositionSlider.value = 0;
                }

                updateTimeText(nowPlayingPositionText, playState.PositionTicks);
                updateTimeText(nowPlayingDurationText, nowPlayingItem.RunTimeTicks, true);

                nowPlayingPositionSlider.disabled = !playState.CanSeek;
            }
        }

        function updateTimeText(elem, ticks, divider) {

            if (ticks == null) {
                elem.innerHTML = '';
                return;
            }

            require(['datetime'], function (datetime) {
                var html = datetime.getDisplayRunningTime(ticks);

                if (divider) {
                    html = '&nbsp;/&nbsp;' + html;
                }

                elem.innerHTML = html;
            });
        }

        function showAudioTrackSelection() {

            var player = currentPlayer;

            var audioTracks = Emby.PlaybackManager.audioTracks(player);

            var currentIndex = Emby.PlaybackManager.getPlayerState(player).PlayState.AudioStreamIndex;

            var menuItems = audioTracks.map(function (stream) {

                var attributes = [];

                attributes.push(stream.Language || Globalize.translate('UnknownLanguage'));

                if (stream.Codec) {
                    attributes.push(stream.Codec);
                }
                if (stream.Profile) {
                    attributes.push(stream.Profile);
                }

                if (stream.BitRate) {
                    attributes.push((Math.floor(stream.BitRate / 1000)) + ' kbps');
                }

                if (stream.Channels) {
                    attributes.push(stream.Channels + ' ch');
                }

                var name = attributes.join(' - ');

                if (stream.IsDefault) {
                    name += ' (D)';
                }

                var opt = {
                    name: name,
                    id: stream.Index
                };

                if (stream.Index == currentIndex) {
                    opt.ironIcon = "check";
                    opt.selected = true;
                }

                return opt;
            });

            require(['actionsheet'], function (actionsheet) {

                actionsheet.show({
                    items: menuItems,
                    title: Globalize.translate('Audio'),
                    callback: function (id) {

                        var index = parseInt(id);
                        if (index != currentIndex) {
                            Emby.PlaybackManager.setAudioStreamIndex(index);
                        }
                    }
                });

            });
        }

        function showSubtitleTrackSelection() {

            var player = currentPlayer;

            var streams = Emby.PlaybackManager.subtitleTracks(player);

            var currentIndex = Emby.PlaybackManager.getPlayerState(player).PlayState.SubtitleStreamIndex;
            if (currentIndex == null) {
                currentIndex = -1;
            }

            streams.unshift({
                Index: -1,
                Language: Globalize.translate('Off')
            });

            var menuItems = streams.map(function (stream) {

                var attributes = [];

                attributes.push(stream.Language || Globalize.translate('LabelUnknownLanguage'));

                if (stream.Codec) {
                    attributes.push(stream.Codec);
                }

                var name = attributes.join(' - ');

                if (stream.IsDefault) {
                    name += ' (D)';
                }
                if (stream.IsForced) {
                    name += ' (F)';
                }
                if (stream.External) {
                    name += ' (EXT)';
                }

                var opt = {
                    name: name,
                    id: stream.Index
                };

                if (stream.Index == currentIndex) {
                    opt.ironIcon = "check";
                    opt.selected = true;
                }

                return opt;
            });

            require(['actionsheet'], function (actionsheet) {

                actionsheet.show({
                    title: Globalize.translate('Subtitles'),
                    items: menuItems,
                    callback: function (id) {
                        var index = parseInt(id);
                        if (index != currentIndex) {
                            Emby.PlaybackManager.setSubtitleStreamIndex(index);
                        }
                    }
                });

            });
        }

        view.addEventListener('viewhide', function () {

            getHeaderElement().classList.remove('hide');
        });

        window.addEventListener('keydown', function (e) {

            if (e.keyCode == 32) {
                Emby.PlaybackManager.playPause();
            }
        });

        view.querySelector('.pageContainer').addEventListener('click', function () {

            Emby.PlaybackManager.playPause();
        });

        view.querySelector('.buttonMute').addEventListener('click', function () {

            Emby.PlaybackManager.toggleMute();
        });

        nowPlayingVolumeSlider.addEventListener('change', function () {

            Emby.PlaybackManager.volume(this.value);
        });

        nowPlayingPositionSlider.addEventListener('change', function () {

            Emby.PlaybackManager.seekPercent(parseFloat(this.value), currentPlayer);
        });

        view.querySelector('.btnPreviousTrack').addEventListener('click', function () {

            Emby.PlaybackManager.previousTrack();
        });

        view.querySelector('.btnPause').addEventListener('click', function () {

            Emby.PlaybackManager.playPause();
        });

        view.querySelector('.btnStop').addEventListener('click', function () {

            Emby.PlaybackManager.stop();
        });

        view.querySelector('.btnNextTrack').addEventListener('click', function () {

            Emby.PlaybackManager.nextTrack();
        });

        view.querySelector('.btnAudio').addEventListener('click', showAudioTrackSelection);
        view.querySelector('.btnSubtitles').addEventListener('click', showSubtitleTrackSelection);

        function onViewHideStopPlayback() {

            if (Emby.PlaybackManager.isPlayingVideo()) {

                // Unbind this event so that we don't go back twice
                Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);

                Emby.PlaybackManager.stop();

                // or 
                //Emby.Page.setTransparency(Emby.TransparencyLevel.Backdrop);
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
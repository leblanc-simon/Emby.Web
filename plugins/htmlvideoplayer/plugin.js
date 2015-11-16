define([], function () {

    return function () {

        var self = this;

        self.name = 'Html Video Player';
        self.type = 'mediaplayer';
        self.packageName = 'htmlvideoplayer';

        var mediaElement;
        var videoDialog;
        var currentSrc;
        var started = false;
        var hlsPlayer;

        self.canPlayMediaType = function (mediaType) {

            return (mediaType || '').toLowerCase() == 'video';
        };

        self.getDeviceProfile = function () {

            return new Promise(function (resolve, reject) {

                require(['browserdeviceprofile'], resolve);
            });
        };

        self.currentSrc = function () {
            return currentSrc;
        };

        self.play = function (streamInfo) {

            started = false;

            return new Promise(function (resolve, reject) {

                createMediaElement({

                    // TODO
                    poster: streamInfo.poster

                }).then(function (elem) {

                    setCurrentSrc(elem, streamInfo).then(resolve, reject);
                });
            });
        };

        function setCurrentSrc(elem, streamInfo) {

            return new Promise(function (resolve, reject) {

                if (!elem) {
                    currentSrc = null;
                    resolve();
                    return;
                }

                if (!streamInfo) {
                    currentSrc = null;
                    elem.src = null;
                    elem.src = "";

                    // When the browser regains focus it may start auto-playing the last video
                    //if ($.browser.safari) {
                    //    elem.src = 'files/dummy.mp4';
                    //    elem.play();
                    //}

                    resolve();
                    return;
                }

                var val = streamInfo.url;

                var dependencies = [];
                var enableHlsJs = enableHlsPlayer(val);

                if (enableHlsJs) {
                    dependencies.push('hlsjs');
                }

                require(dependencies, function (Hls) {

                    //if (AppInfo.isNativeApp && $.browser.safari) {
                    //    val = val.replace('file://', '');
                    //}

                    var startTime = getStartTime(val);
                    var playNow = false;

                    destroyHlsPlayer();

                    var tracks = streamInfo.textTracks || [];

                    if (enableHlsJs) {

                        setTracks(elem, tracks);

                        var hls = new Hls();
                        hls.loadSource(val);
                        hls.attachVideo(elem);
                        hls.on(Hls.Events.MANIFEST_PARSED, function () {
                            elem.play();
                        });
                        hlsPlayer = hls;

                    } else {

                        elem.src = val;
                        elem.autoplay = true;

                        setTracks(elem, tracks);

                        elem.addEventListener('loadedmetadata', onLoadedMetadata);
                        playNow = true;
                    }

                    var currentTrackIndex = -1;
                    for (var i = 0, length = tracks.length; i < length; i++) {
                        if (tracks[i].isDefault) {
                            currentTrackIndex = i;
                            break;
                        }
                    }

                    setCurrentTrackElement(currentTrackIndex);

                    currentSrc = val;

                    if (playNow) {
                        elem.play();
                    }

                    setFullScreen(streamInfo.fullscreen);

                    resolve();
                });
            });
        }

        function setFullScreen(enabled) {

            require(['screenfull'], function () {

                if (screenfull.enabled) {
                    if (enabled) {
                        screenfull.request(mediaElement);
                    } else {
                        screenfull.exit();
                    }
                }
            });
        }

        // Save this for when playback stops, because querying the time at that point might return 0
        self.currentTime = function (val) {

            if (mediaElement) {
                if (val != null) {
                    mediaElement.currentTime = val / 1000;
                    return;
                }

                return (mediaElement.currentTime || 0) * 1000;
            }
        };

        self.duration = function (val) {

            if (mediaElement) {
                return mediaElement.duration;
            }

            return null;
        };

        self.stop = function (destroyPlayer) {

            var elem = mediaElement;
            var src = currentSrc;

            if (elem && src) {

                elem.pause();

                destroyHlsPlayer();

                onEnded();

                if (destroyPlayer) {
                    self.destroy();
                }
            }
        };

        self.destroy = function () {

            destroyHlsPlayer();

            var videoElement = mediaElement;

            if (videoElement) {

                mediaElement = null;

                videoElement.removeEventListener('timeupdate', onTimeUpdate);
                videoElement.removeEventListener('ended', onEnded);
                videoElement.removeEventListener('volumechange', onVolumeChange);
                videoElement.removeEventListener('pause', onPause);
                videoElement.removeEventListener('playing', onPlaying);
                videoElement.removeEventListener('error', onError);
                videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);
                videoElement.removeEventListener('click', onClick);
                videoElement.removeEventListener('dblclick', onDblClick);
            }

            var dlg = videoDialog;
            if (dlg) {

                videoDialog = null;

                require(['paperdialoghelper'], function (paperdialoghelper) {

                    paperdialoghelper.close(dlg);
                });
            }
        };

        function destroyHlsPlayer() {
            var player = hlsPlayer;
            if (player) {
                try {
                    player.destroy();
                }
                catch (err) {
                    Logger.log(err);
                }

                hlsPlayer = null;
            }
        }

        self.pause = function () {
            if (mediaElement) {
                mediaElement.pause();
            }
        };

        self.unpause = function () {
            if (mediaElement) {
                mediaElement.play();
            }
        };

        self.paused = function () {

            if (mediaElement) {
                return mediaElement.paused;
            }

            return false;
        };

        self.volume = function (val) {
            if (mediaElement) {
                if (val != null) {
                    mediaElement.volume = val / 100;
                    return;
                }

                return mediaElement.volume * 100;
            }
        };

        self.setMute = function (mute) {

            if (mute) {
                self.volume(0);
            } else {

                if (self.isMuted()) {
                    self.volume(50);
                }
            }
        };

        self.isMuted = function () {
            return self.volume() == 0;
        };

        function onEnded() {

            var stopInfo = {
                src: currentSrc
            };

            Events.trigger(self, 'stopped', [stopInfo]);
            currentSrc = null;
        }

        function onTimeUpdate() {

            Events.trigger(self, 'timeupdate');
        }

        function onVolumeChange() {

            Events.trigger(self, 'volumechange');
        }

        function onPlaying() {

            if (!started) {
                started = true;
                Events.trigger(self, 'started');
            }
            Events.trigger(self, 'playing');
        }

        function onClick() {
            Events.trigger(self, 'click');
        }

        function onDblClick() {
            Events.trigger(self, 'dblclick');
        }

        function onPause() {
            Events.trigger(self, 'pause');
        }

        function onError() {

            var errorCode = this.error ? this.error.code : '';
            Logger.log('Media element error code: ' + errorCode);

            Events.trigger(self, 'error');
        }

        function onLoadedMetadata(e) {

            var mediaElem = e.target;
            mediaElem.removeEventListener('loadedmetadata', onLoadedMetadata);

            if (!hlsPlayer) {
                mediaElem.play();
            }
        }

        function enableHlsPlayer(src) {

            if (src) {
                if (src.indexOf('.m3u8') == -1) {
                    return false;
                }
            }

            return window.MediaSource != null && !canPlayNativeHls();
        }

        function canPlayNativeHls() {
            var media = document.createElement('video');

            if (media.canPlayType('application/x-mpegURL').replace(/no/, '') ||
                media.canPlayType('application/vnd.apple.mpegURL').replace(/no/, '')) {
                return true;
            }

            return false;
        }

        function getStartTime(url) {

            var src = url;

            var parts = src.split('#');

            if (parts.length > 1) {

                parts = parts[parts.length - 1].split('=');

                if (parts.length == 2) {

                    return parseFloat(parts[1]);
                }
            }

            return 0;
        }

        function enableCustomVideoControls() {
            return true;
        }

        function setTracks(elem, tracks) {
            var html = tracks.map(function (t) {

                var defaultAttribute = t.isDefault ? ' default' : '';

                return '<track kind="subtitles" src="' + t.url + '" srclang="' + t.language + '"' + defaultAttribute + '></track>';

            }).join('');

            if (html) {
                elem.innerHTML = html;
            }
        }

        var _supportsTextTracks;
        function supportsTextTracks() {

            if (_supportsTextTracks == null) {
                _supportsTextTracks = document.createElement('video').textTracks != null;
            }

            // For now, until ready
            return _supportsTextTracks;
        }

        function setCurrentTrackElement(trackIndex) {

            Logger.log('Setting new text track index to: ' + trackIndex);

            var allTracks = mediaElement.textTracks; // get list of tracks

            var modes = ['disabled', 'showing', 'hidden'];

            for (var i = 0; i < allTracks.length; i++) {

                var mode;

                if (trackIndex == i) {
                    mode = 1; // show this track
                } else {
                    mode = 0; // hide all other tracks
                }

                Logger.log('Setting track ' + i + ' mode to: ' + mode);

                // Safari uses integers for the mode property
                // http://www.jwplayer.com/html5/scripting/
                var useNumericMode = false;

                if (!isNaN(allTracks[i].mode)) {
                    useNumericMode = true;
                }

                if (useNumericMode) {
                    allTracks[i].mode = mode;
                } else {
                    allTracks[i].mode = modes[mode];
                }
            }
        };

        function updateTextStreamUrls(startPositionTicks) {

            if (!supportsTextTracks()) {
                return;
            }

            var allTracks = mediaElement.textTracks; // get list of tracks
            var i;

            for (i = 0; i < allTracks.length; i++) {

                var track = allTracks[i];

                // This throws an error in IE, but is fine in chrome
                // In IE it's not necessary anyway because changing the src seems to be enough
                try {
                    while (track.cues.length) {
                        track.removeCue(track.cues[0]);
                    }
                } catch (e) {
                    Logger.log('Error removing cue from textTrack');
                }
            }

            var tracks = mediaElement.querySelectorAll('track');
            for (i = 0; i < tracks.length; i++) {

                var track = tracks[i];

                track.src = replaceQueryString(track.src, 'startPositionTicks', startPositionTicks);
            }
        }

        function createMediaElement(options) {

            return new Promise(function (resolve, reject) {

                var dlg = document.querySelector('.videoPlayerDialog');

                if (!dlg) {

                    require(['paperdialoghelper', 'css!' + Emby.PluginManager.mapRequire(self, 'style.css')], function (paperdialoghelper) {

                        var requiresNativeControls = !enableCustomVideoControls();

                        // Safari often displays the poster under the video and it doesn't look good
                        var poster = /*!$.browser.safari &&*/ options.poster ? (' poster="' + options.poster + '"') : '';

                        var dlg = paperdialoghelper.createDialog({
                            removeOnClose: true
                        });

                        dlg.classList.add('videoPlayerDialog');

                        var html = '';
                        // Can't autoplay in these browsers so we need to use the full controls
                        if (requiresNativeControls) {
                            html += '<video preload="metadata" autoplay="autoplay" crossorigin="anonymous"' + poster + ' controls="controls" webkit-playsinline>';
                        }
                        else {

                            // Chrome 35 won't play with preload none
                            html += '<video preload="metadata" autoplay="autoplay" crossorigin="anonymous"' + poster + ' webkit-playsinline>';
                        }

                        html += '</video>';

                        dlg.innerHTML = html;
                        var videoElement = dlg.querySelector('video');

                        videoElement.addEventListener('timeupdate', onTimeUpdate);
                        videoElement.addEventListener('ended', onEnded);
                        videoElement.addEventListener('volumechange', onVolumeChange);
                        videoElement.addEventListener('pause', onPause);
                        videoElement.addEventListener('playing', onPlaying);
                        videoElement.addEventListener('error', onError);
                        videoElement.addEventListener('click', onClick);
                        videoElement.addEventListener('dblclick', onDblClick);

                        document.body.appendChild(dlg);
                        videoDialog = dlg;
                        mediaElement = videoElement;

                        paperdialoghelper.open(dlg).then(onPlayerClosed);

                        resolve(videoElement);
                    });

                } else {
                    resolve(dlg.querySelector('video'));
                }
            });
        }

        function onPlayerClosed(result) {

            if (result.closedByBack) {
                Emby.PlaybackManager.stop();
            }
        }
    }
});
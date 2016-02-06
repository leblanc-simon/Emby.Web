define(['events'], function (Events) {

    return function () {

        var self = this;

        self.name = 'Html Andio Player';
        self.type = 'mediaplayer';
        self.id = 'htmlaudioplayer';

        // Let any players created by plugins take priority
        self.priority = 1;

        var mediaElement;
        var currentSrc;
        var started = false;

        self.canPlayMediaType = function (mediaType) {

            return (mediaType || '').toLowerCase() == 'audio';
        };

        self.getDeviceProfile = function () {

            return new Promise(function (resolve, reject) {

                require(['browserdeviceprofile'], resolve);
            });
        };

        self.currentSrc = function () {
            return currentSrc;
        };

        self.play = function (options) {

            started = false;

            return new Promise(function (resolve, reject) {

                var elem = createMediaElement();

                var val = options.url;

                elem.crossOrigin = getCrossOriginValue(options.mediaSource);
                elem.src = val;
                currentSrc = val;
                elem.play();
                resolve();
            });
        };

        function getCrossOriginValue(mediaSource) {

            return 'anonymous';
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

        self.stop = function (destroyPlayer, reportEnded) {

            return new Promise(function (resolve, reject) {

                cancelFadeTimeout();

                var elem = mediaElement;
                var src = currentSrc;

                if (elem && src) {

                    if (!destroyPlayer) {

                        if (!elem.paused) {
                            elem.pause();
                        }
                        onEndedInternal(reportEnded);
                        resolve();
                        return;
                    }

                    var originalVolume = elem.volume;

                    fade(elem, function () {

                        if (!elem.paused) {
                            elem.pause();
                        }

                        elem.volume = originalVolume;
                        onEndedInternal(reportEnded);
                        resolve();
                    });
                }
            });
        };

        self.destroy = function () {

        };

        var fadeTimeout;
        function fade(elem, callback) {

            elem.volume = Math.max(0, elem.volume - .15);

            if (!elem.volume) {
                callback();
                return;
            }
            cancelFadeTimeout();
            fadeTimeout = setTimeout(function () {
                fade(elem, callback);
            }, 100);
        }

        function cancelFadeTimeout() {
            var timeout = fadeTimeout;
            if (timeout) {
                clearTimeout(timeout);
                fadeTimeout = null;
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

            onEndedInternal(true);
        }

        function onEndedInternal(triggerEnded) {

            if (triggerEnded) {
                var stopInfo = {
                    src: currentSrc
                };

                Events.trigger(self, 'stopped', [stopInfo]);
            }

            currentSrc = null;
        }

        function onTimeUpdate() {

            Events.trigger(self, 'timeupdate');
        }

        function onVolumeChange() {

            if (!fadeTimeout) {
                Events.trigger(self, 'volumechange');
            }
        }

        function onPlaying() {

            if (!started) {
                started = true;
                Events.trigger(self, 'started');
            }
            Events.trigger(self, 'playing');
        }

        function onPause() {
            Events.trigger(self, 'pause');
        }

        function onError() {

            var errorCode = this.error ? this.error.code : '';
            console.log('Media element error code: ' + errorCode);

            Events.trigger(self, 'error');
        }

        function createMediaElement() {

            var elem = document.querySelector('.mediaPlayerAudio');

            if (!elem) {
                var elem = document.createElement('audio');
                elem.classList.add('mediaPlayerAudio');
                elem.classList.add('hide');

                document.body.appendChild(elem);

                elem.addEventListener('timeupdate', onTimeUpdate);
                elem.addEventListener('ended', onEnded);
                elem.addEventListener('volumechange', onVolumeChange);
                elem.addEventListener('pause', onPause);
                elem.addEventListener('playing', onPlaying);
                elem.addEventListener('error', onError);
            }

            mediaElement = elem;

            return elem;
        }
    }
});
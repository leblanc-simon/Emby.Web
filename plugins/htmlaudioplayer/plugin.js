define([], function () {

    return function () {

        var self = this;

        self.name = 'Html Andio Player';
        self.type = 'mediaplayer';
        self.packageName = 'htmlaudioplayer';

        var mediaElement;
        var currentSrc;
        var started = false;

        self.canPlayMediaType = function (mediaType) {

            return (mediaType || '').toLowerCase() == 'audio';
        };

        self.getDeviceProfile = function () {

            var canPlayWebm = false;//self.canPlayWebm();
            var canPlayHls = true;
            var canPlayH264 = true;
            // Should be chrome only
            var supportsMkv = true;
            var canPlayAac = true;

            var profile = {};

            profile.MaxStreamingBitrate = 10000000;
            profile.MaxStaticBitrate = 8000000;
            profile.MusicStreamingTranscodingBitrate = 192000;

            profile.DirectPlayProfiles = [];

            var preferAacAudio = false; // $.browser.safari

            if (canPlayH264) {
                profile.DirectPlayProfiles.push({
                    Container: 'mp4,m4v',
                    Type: 'Video',
                    VideoCodec: 'h264',
                    AudioCodec: 'aac,mp3'
                });
            }

            if (supportsMkv) {
                profile.DirectPlayProfiles.push({
                    Container: 'mkv',
                    Type: 'Video',
                    VideoCodec: 'h264',
                    AudioCodec: 'aac,mp3'
                });

                profile.DirectPlayProfiles.push({
                    Container: 'mov',
                    Type: 'Video',
                    VideoCodec: 'h264',
                    AudioCodec: 'aac,mp3'
                });
            }

            profile.DirectPlayProfiles.push({
                Container: 'mp3',
                Type: 'Audio'
            });

            if (canPlayAac) {
                profile.DirectPlayProfiles.push({
                    Container: 'aac',
                    Type: 'Audio'
                });
            }

            if (canPlayWebm) {
                profile.DirectPlayProfiles.push({
                    Container: 'webm',
                    Type: 'Video'
                });
                profile.DirectPlayProfiles.push({
                    Container: 'webm,webma',
                    Type: 'Audio'
                });
            }

            profile.TranscodingProfiles = [];

            if (canPlayHls) {
                profile.TranscodingProfiles.push({
                    Container: 'ts',
                    Type: 'Video',
                    AudioCodec: 'aac',
                    VideoCodec: 'h264',
                    Context: 'Streaming',
                    Protocol: 'hls'
                });

                if (canPlayAac && preferAacAudio) {
                    profile.TranscodingProfiles.push({
                        Container: 'ts',
                        Type: 'Audio',
                        AudioCodec: 'aac',
                        Context: 'Streaming',
                        Protocol: 'hls'
                    });
                }
            }

            if (canPlayWebm) {

                profile.TranscodingProfiles.push({
                    Container: 'webm',
                    Type: 'Video',
                    AudioCodec: 'vorbis',
                    VideoCodec: 'vpx',
                    Context: 'Streaming',
                    Protocol: 'http'
                });
            }

            profile.TranscodingProfiles.push({
                Container: 'mp4',
                Type: 'Video',
                AudioCodec: 'aac',
                VideoCodec: 'h264',
                Context: 'Streaming',
                Protocol: 'http'
            });

            if (canPlayAac && preferAacAudio) {

                profile.TranscodingProfiles.push({
                    Container: 'aac',
                    Type: 'Audio',
                    AudioCodec: 'aac',
                    Context: 'Streaming',
                    Protocol: 'http'
                });

            } else {
                profile.TranscodingProfiles.push({
                    Container: 'mp3',
                    Type: 'Audio',
                    AudioCodec: 'mp3',
                    Context: 'Streaming',
                    Protocol: 'http'
                });
            }

            profile.ContainerProfiles = [];

            profile.CodecProfiles = [];
            profile.CodecProfiles.push({
                Type: 'Audio',
                Conditions: [{
                    Condition: 'LessThanEqual',
                    Property: 'AudioChannels',
                    Value: '2'
                }]
            });

            profile.CodecProfiles.push({
                Type: 'VideoAudio',
                Codec: 'aac',
                Container: 'mkv,mov',
                Conditions: [
                    {
                        Condition: 'NotEquals',
                        Property: 'AudioProfile',
                        Value: 'HE-AAC'
                    }
                    // Disabling this is going to require us to learn why it was disabled in the first place
                    ,
                    {
                        Condition: 'NotEquals',
                        Property: 'AudioProfile',
                        Value: 'LC'
                    }
                ]
            });

            profile.CodecProfiles.push({
                Type: 'VideoAudio',
                Codec: 'aac',
                Conditions: [
                    {
                        Condition: 'LessThanEqual',
                        Property: 'AudioChannels',
                        Value: '6'
                    }
                ]
            });

            profile.CodecProfiles.push({
                Type: 'Video',
                Codec: 'h264',
                Conditions: [
                {
                    Condition: 'NotEquals',
                    Property: 'IsAnamorphic',
                    Value: 'true',
                    IsRequired: false
                },
                {
                    Condition: 'EqualsAny',
                    Property: 'VideoProfile',
                    Value: 'high|main|baseline|constrained baseline'
                },
                {
                    Condition: 'LessThanEqual',
                    Property: 'VideoLevel',
                    Value: '41'
                }]
            });

            profile.CodecProfiles.push({
                Type: 'Video',
                Codec: 'vpx',
                Conditions: [
                {
                    Condition: 'NotEquals',
                    Property: 'IsAnamorphic',
                    Value: 'true',
                    IsRequired: false
                }]
            });

            // Subtitle profiles
            // External vtt or burn in
            profile.SubtitleProfiles = [];
            profile.SubtitleProfiles.push({
                Format: 'vtt',
                Method: 'External'
            });

            profile.ResponseProfiles = [];

            //profile.ResponseProfiles.push({
            //    Type: 'Video',
            //    Container: 'mkv',
            //    MimeType: 'video/webm'
            //});

            profile.ResponseProfiles.push({
                Type: 'Video',
                Container: 'm4v',
                MimeType: 'video/mp4'
            });

            profile.ResponseProfiles.push({
                Type: 'Video',
                Container: 'mov',
                MimeType: 'video/webm'
            });

            return profile;

        };

        self.currentSrc = function () {
            return currentSrc;
        };

        self.play = function (streamInfo) {

            started = false;

            return new Promise(function (resolve, reject) {

                var elem = createAudioElement();

                var val = streamInfo.url;

                elem.src = val;
                currentSrc = val;
                elem.play();
                resolve();
            });
        };

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

        self.stop = function () {

            cancelFadeTimeout();

            var elem = mediaElement;
            var src = currentSrc;

            if (elem && src) {

                if (elem.paused) {
                    onEnded();
                    return;
                }

                var originalVolume = elem.volume;

                fade(elem, function () {

                    if (!elem.paused) {
                        elem.pause();
                    }

                    elem.volume = originalVolume;
                    onEnded();
                });
            }
        };

        var fadeTimeout;
        function fade(elem, callback) {

            elem.volume = Math.max(0, elem.volume - .1);

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

            if (!fadeOutTimeout) {
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
            Logger.log('Media element error code: ' + errorCode);

            Events.trigger(self, 'error');
        }

        function createAudioElement() {

            var elem = document.querySelector('.mediaPlayerAudio');

            if (!elem) {
                var elem = document.createElement('audio');
                elem.classList.add('mediaPlayerAudio');
                elem.classList.add('hide');
                elem.crossorigin = "anonymous";

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
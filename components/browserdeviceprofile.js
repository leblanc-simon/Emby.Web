define(['browser'], function (browser) {

    var supportedFormats;
    function getSupportedFormats() {

        if (supportedFormats) {
            return supportedFormats;
        }

        var list = [];
        var elem = document.createElement('video');

        if (elem.canPlayType('video/webm').replace(/no/, '')) {
            list.push('webm');
        }
        if (elem.canPlayType('audio/mp4; codecs="ac-3"').replace(/no/, '')) {
            list.push('ac3');
        }
        if (browser.chrome) {
            list.push('mkv');
        }

        var canPlayH264 = true;
        var userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('firefox') != -1 && userAgent.indexOf('windows') == -1) {
            canPlayH264 = false;
        }

        if (canPlayH264) {
            list.push('h264');
        }

        if (document.createElement('audio').canPlayType('audio/aac').replace(/no/, '')) {
            list.push('aac');
        }

        if (document.createElement('audio').canPlayType('audio/mp3').replace(/no/, '')) {
            list.push('mp3');
        }

        supportedFormats = list;
        return list;
    }

    var _supportsTextTracks;
    function supportsTextTracks() {

        if (_supportsTextTracks == null) {
            _supportsTextTracks = document.createElement('video').textTracks != null;
        }

        // For now, until ready
        return _supportsTextTracks;
    }

    var _canPlayHls;
    function canPlayHls(src) {

        if (_canPlayHls == null) {
            _canPlayHls = window.MediaSource != null || canPlayNativeHls();
        }
        return _canPlayHls;
    }

    function canPlayNativeHls() {
        var media = document.createElement('video');

        if (media.canPlayType('application/x-mpegURL').replace(/no/, '') ||
            media.canPlayType('application/vnd.apple.mpegURL').replace(/no/, '')) {
            return true;
        }

        return false;
    }

    return function () {

        var bitrateSetting = 100000000;

        var supportedFormats = getSupportedFormats();

        var canPlayWebm = supportedFormats.indexOf('webm') != -1;
        var canPlayAc3 = supportedFormats.indexOf('ac3') != -1;
        var canPlayMp3 = supportedFormats.indexOf('mp3') != -1;
        var canPlayAac = supportedFormats.indexOf('aac') != -1;
        var canPlayMkv = supportedFormats.indexOf('mkv') != -1;

        var profile = {};

        profile.MaxStreamingBitrate = bitrateSetting;
        profile.MaxStaticBitrate = 100000000;
        profile.MusicStreamingTranscodingBitrate = Math.min(bitrateSetting, 192000);

        profile.DirectPlayProfiles = [];

        if (supportedFormats.indexOf('h264') != -1) {
            profile.DirectPlayProfiles.push({
                Container: 'mp4,m4v',
                Type: 'Video',
                VideoCodec: 'h264',
                AudioCodec: 'aac' + (canPlayMp3 ? ',mp3' : '') + (canPlayAc3 ? ',ac3' : '')
            });
        }

        if (browser.chrome) {
            profile.DirectPlayProfiles.push({
                Container: 'mkv,mov',
                Type: 'Video',
                VideoCodec: 'h264',
                AudioCodec: 'aac' + (canPlayMp3 ? ',mp3' : '') + (canPlayAc3 ? ',ac3' : '')
            });
        }

        if (canPlayMp3) {
            profile.DirectPlayProfiles.push({
                Container: 'mp3',
                Type: 'Audio'
            });
        }

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

        if (canPlayMp3) {
            profile.TranscodingProfiles.push({
                Container: 'mp3',
                Type: 'Audio',
                AudioCodec: 'mp3',
                Context: 'Streaming',
                Protocol: 'http'
            });
            profile.TranscodingProfiles.push({
                Container: 'mp3',
                Type: 'Audio',
                AudioCodec: 'mp3',
                Context: 'Static',
                Protocol: 'http'
            });
        }
        if (canPlayAac) {
            profile.TranscodingProfiles.push({
                Container: 'aac',
                Type: 'Audio',
                AudioCodec: 'aac',
                Context: 'Streaming',
                Protocol: 'http'
            });

            profile.TranscodingProfiles.push({
                Container: 'aac',
                Type: 'Audio',
                AudioCodec: 'aac',
                Context: 'Static',
                Protocol: 'http'
            });
        }

        // Can't use mkv on mobile because we have to use the native player controls and they won't be able to seek it
        if (canPlayMkv && !browser.mobile) {
            profile.TranscodingProfiles.push({
                Container: 'mkv',
                Type: 'Video',
                AudioCodec: 'aac' + (canPlayAc3 ? ',ac3' : ''),
                VideoCodec: 'h264',
                Context: 'Streaming'
            });
        }

        if (canPlayHls()) {
            profile.TranscodingProfiles.push({
                Container: 'ts',
                Type: 'Video',
                AudioCodec: 'aac' + (canPlayAc3 ? ',ac3' : ''),
                VideoCodec: 'h264',
                Context: 'Streaming',
                Protocol: 'hls'
            });

            if (canPlayAac) {
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

        profile.TranscodingProfiles.push({
            Container: 'mp4',
            Type: 'Video',
            AudioCodec: 'aac',
            VideoCodec: 'h264',
            Context: 'Static',
            Protocol: 'http'
        });

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
                //,
                //{
                //    Condition: 'NotEquals',
                //    Property: 'AudioProfile',
                //    Value: 'LC'
                //}
            ]
        });

        profile.CodecProfiles.push({
            Type: 'VideoAudio',
            Codec: 'aac,mp3',
            Conditions: [
                {
                    Condition: 'LessThanEqual',
                    Property: 'AudioChannels',
                    Value: '6'
                }
            ]
        });

        profile.CodecProfiles.push({
            Type: 'VideoAudio',
            Conditions: [
                {
                    Condition: 'Equals',
                    Property: 'IsSecondaryAudio',
                    Value: 'false',
                    IsRequired: 'false'
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
        if (supportsTextTracks()) {

            profile.SubtitleProfiles.push({
                Format: 'vtt',
                Method: 'External'
            });
        }

        profile.ResponseProfiles = [];

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
    }();
});
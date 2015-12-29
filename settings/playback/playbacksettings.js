(function (document) {

    document.addEventListener("viewinit-playbacksettings", function (e) {

        new settingsPage(e.target);
    });

    function settingsPage(view) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var element = e.detail.element;
            var params = e.detail.params;
            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('core#PlaybackSettings'));

            require(['loading'], function (loading) {
                loading.hide();
            });

            if (!isRestored) {
                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            var selectStreamingBitrate = view.querySelector('.selectStreamingBitrate');

            require(['appsettings'], function (appSettings) {

                if (selectStreamingBitrate.getValue()) {
                    appSettings.maxStreamingBitrate(selectStreamingBitrate.getValue());
                    appSettings.enableAutomaticBitrateDetection(false);
                } else {
                    appSettings.enableAutomaticBitrateDetection(true);
                }

            });
        });

        function renderSettings() {

            Emby.FocusManager.autoFocus(view);

            require(['appsettings', 'qualityoptions'], function (appSettings, qualityoptions) {

                var bitrateOptions = qualityoptions.getVideoQualityOptions().map(function (i) {
                    return {
                        name: i.name,
                        value: i.bitrate
                    };
                });

                bitrateOptions.unshift({
                    name: Globalize.translate('core#OptionAutomatic'),
                    value: ''
                });

                var selectStreamingBitrate = view.querySelector('.selectStreamingBitrate');
                selectStreamingBitrate.setOptions(bitrateOptions);

                if (appSettings.enableAutomaticBitrateDetection()) {
                    selectStreamingBitrate.setValue('');
                } else {
                    selectStreamingBitrate.setValue(appSettings.maxStreamingBitrate());
                }
                selectStreamingBitrate.setValue('2');

            });
        }
    }

})(document);
define(['loading', 'userSettings', 'focusManager'], function (loading, userSettings, focusManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('DefaultTheme'));

            loading.hide();

            if (!isRestored) {

                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            userSettings.set('antispoilers', view.querySelector('.selectEnableEpisodeAntiSpoliers').getValue());
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            view.querySelector('.selectEnableEpisodeAntiSpoliers').setValue(userSettings.get('antispoilers') || 'true');
        }
    }

});
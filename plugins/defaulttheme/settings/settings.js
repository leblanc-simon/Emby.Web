define(['loading', './../themesettings', 'focusManager'], function (loading, themeSettings, focusManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('ThemeName'));

            loading.hide();

            if (!isRestored) {

                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            themeSettings.enableAntiSpoliers(view.querySelector('.selectEnableEpisodeAntiSpoliers').getValue());
            themeSettings.dimUnselectedPosters(view.querySelector('.selectDimPosters').getValue());

            themeSettings.apply();
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            view.querySelector('.selectEnableEpisodeAntiSpoliers').setValue(themeSettings.enableAntiSpoliers());
            view.querySelector('.selectDimPosters').setValue(themeSettings.dimUnselectedPosters());
        }
    }

});
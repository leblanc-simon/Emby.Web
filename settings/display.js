require(['usersettings', 'loading'], function (userSettings, loading) {

    document.addEventListener("viewinit-displaysettings", function (e) {

        new settingsPage(e.target);
    });

    function settingsPage(view) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var element = e.detail.element;
            var params = e.detail.params;
            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('core#DisplaySettings'));

            loading.hide();

            if (!isRestored) {
                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            var selectLanguage = view.querySelector('.selectLanguage');

            userSettings.set('language', selectLanguage.getValue());
        });

        function renderSettings() {

            Emby.FocusManager.autoFocus(view);

            var selectLanguage = view.querySelector('.selectLanguage');

            selectLanguage.setValue(userSettings.get('language'));
        }
    }

});
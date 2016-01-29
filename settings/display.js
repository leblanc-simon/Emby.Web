define(['loading', 'userSettings', 'focusManager'], function (loading, userSettings, focusManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('core#DisplaySettings'));

            loading.hide();

            if (!isRestored) {

                // If auto-detection isn't working, then remove the auto item
                if (!navigator.language) {

                    var autoItem = view.querySelector('.autoDropdownItem');
                    autoItem.parentNode.removeChild(autoItem);
                }

                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            var selectLanguage = view.querySelector('.selectLanguage');

            userSettings.set('language', selectLanguage.getValue());
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            var selectLanguage = view.querySelector('.selectLanguage');

            selectLanguage.setValue(userSettings.get('language') || '');
        }
    }

});
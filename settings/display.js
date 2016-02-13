define(['loading', 'userSettings', 'focusManager', 'pluginManager'], function (loading, userSettings, focusManager, pluginManager) {

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

            userSettings.set('theme', view.querySelector('.selectTheme').getValue());
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            var selectLanguage = view.querySelector('.selectLanguage');

            selectLanguage.setValue(userSettings.get('language') || '');

            var selectTheme = view.querySelector('.selectTheme');

            var options = pluginManager.ofType('theme').map(function (plugin) {
                return {
                    name: plugin.name,
                    value: plugin.id
                };
            });

            selectTheme.setOptions(options);
            selectTheme.setValue(userSettings.get('theme') || options[0].value);
        }
    }

});
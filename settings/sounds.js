define(['loading', 'userSettings', 'pluginManager', 'focusManager'], function (loading, userSettings, pluginManager, focusManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('core#Sounds'));

            loading.hide();

            if (!isRestored) {
                renderSettings();
            }
        });

        view.addEventListener('viewbeforehide', function (e) {

            userSettings.set('soundeffects', view.querySelector('.selectSoundEffects').getValue());
        });

        function renderSettings() {

            focusManager.autoFocus(view);

            var selectSoundEffects = view.querySelector('.selectSoundEffects');

            var options = pluginManager.ofType('soundeffects').map(function (plugin) {
                return {
                    name: plugin.name,
                    value: plugin.id
                };
            });

            options.unshift({
                name: Globalize.translate('core#None'),
                value: 'none'
            });

            selectSoundEffects.setOptions(options);

            selectSoundEffects.setValue(userSettings.get('soundeffects') || options[1].value);
        }
    }

});
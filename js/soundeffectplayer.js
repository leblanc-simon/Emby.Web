define(['soundeffects', 'pluginManager', 'userSettings', 'connectionManager', 'events'], function (soundeffects, pluginManager, userSettings, connectionManager, events) {

    var effects = {};
    var defaultOption = 'defaultsoundeffects';

    function reload() {

        var soundeffectOption;
        try {
            soundeffectOption = userSettings.get('soundeffects');
        } catch (err) {
        }

        if (!soundeffectOption) {
            soundeffectOption = defaultOption;
        }

        if (soundeffectOption == 'none') {
            effects = {};
            return;
        }

        var soundeffectPlugin = pluginManager.ofType('soundeffects').filter(function (i) {
            return i.id == soundeffectOption;
        })[0];

        if (!soundeffectPlugin) {
            soundeffectPlugin = pluginManager.ofType('soundeffects').filter(function (i) {
                return i.id == defaultOption;
            })[0];
        }

        if (soundeffectPlugin) {
            effects = soundeffectPlugin.getEffects();
        } else {
            effects = {};
        }
    }

    function onKeyDown(evt) {

        switch (evt.keyCode) {

            case 37:
            case 38:
            case 39:
            case 40:
                if (!evt.altKey) {
                    play('navigation');
                }
                break;
            case 13:
                play('select');
                break;
        }
    }

    function play(type) {

        var effect = effects[type];

        if (effect) {
            soundeffects.play({
                path: effect
            });
        }
    }

    window.addEventListener('keydown', onKeyDown);

    reload();

    events.on(connectionManager, 'localusersignedin', reload);
    events.on(userSettings, 'change', function (e, name) {
        if (name == 'soundeffects') {
            reload();
        }
    });

});
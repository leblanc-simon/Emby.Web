define(['soundeffects'], function (soundeffects) {

    var effects = {};

    function reload() {

        var soundeffectPlugin = Emby.PluginManager.ofType('soundeffects')[0];
        if (soundeffectPlugin) {
            effects = soundeffectPlugin.getEffects();
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

});
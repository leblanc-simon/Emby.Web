(function (globalScope, document) {

    var effects;
    var soundEffectPlayer;

    function load() {

        require(['soundeffects'], function (soundeffects) {

            soundEffectPlayer = soundeffects;

            var soundeffectPlugin = Emby.PluginManager.ofType('soundeffects')[0];

            if (soundeffectPlugin) {

                effects = soundeffectPlugin.getEffects();
                window.addEventListener('keydown', onKeyDown, true);
            }
        });
    }

    function unload() {
        window.removeEventListener('keydown', onKeyDown);
        effects = null;
    }

    function onKeyDown(evt) {

        switch (evt.keyCode) {

            case 37:
            case 38:
            case 39:
            case 40:
                play('navigation');
                break;
            case 13:
                play('select');
                break;
        }
    }

    function play(type) {

        var effect = effects[type];

        if (effect) {
            soundEffectPlayer.play({
                path: effect
            });
        }
    }

    load();

})(this, document);

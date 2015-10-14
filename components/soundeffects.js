define([], function () {

    var sounds = {};

    function play(options) {
        var path = options.path;

        var sound = sounds[path];

        if (!sound) {
            sound = new Howl({
                urls: [path],
                volume: .3
            });
            sounds[path] = sound;
        }

        sound.play();
    }

    return {
        play: function (options) {

            if (window.Howl) {
                play(options);
                return;
            }

            require(['howler'], function (howler) {
                play(options);
            });
        },
        isSupported: function () {
            return true;
        }
    };
});
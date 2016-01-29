define([], function () {

    return function () {

        var self = this;

        self.name = 'Default Sound Effects';
        self.type = 'soundeffects';
        self.id = 'defaultsoundeffects';

        self.getEffects = function () {
            return {
                navigation: 'navigation.wav',
                select: 'select.wav'
            };
        };
    }
});
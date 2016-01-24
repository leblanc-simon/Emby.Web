define(['pluginManager'], function (pluginManager) {

    return function () {

        var self = this;

        self.name = 'Default Sound Effects';
        self.type = 'soundeffects';
        self.packageName = 'defaultsoundeffects';
        self.id = 'defaultsoundeffects';

        self.getEffects = function() {
            return {
                navigation: pluginManager.mapPath(self, 'navigation.wav'),
                select: pluginManager.mapPath(self, 'select.wav')
            };
        };
    }
});
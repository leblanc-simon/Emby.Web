define([], function () {

    return function () {

        var self = this;

        self.name = 'Default Sound Effects';
        self.type = 'soundeffects';
        self.packageName = 'defaultsoundeffects';

        self.getEffects = function() {
            return {
                //navigation: Emby.PluginManager.mapPath(self, 'navigation.mp3'),
                //select: Emby.PluginManager.mapPath(self, 'select.mp3')
            };
        };
    }
});
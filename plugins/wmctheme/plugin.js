define([], function () {

    return function () {

        var self = this;

        self.name = 'Windows Media Center Theme';
        self.type = 'theme';
        self.packageName = 'wmctheme';

        self.getHeaderTemplate = function () {
            return Emby.PluginManager.mapPath(self, 'header.html');
        };

        self.getDependencies = function () {

            var files = [
                'css!' + Emby.PluginManager.mapPath(self, 'css/style')
            ];

            return files;
        };

        self.getTranslations = function () {

            var files = [];

            return files;
        };

        self.getRoutes = function () {
            // Routes, relative to the current directory. The app will handle normalizing the full path

            var routes = [];

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'home.html'),
                id: 'wmctheme-home',
                transition: 'fade',
                type: 'home',
                dependencies: []
            });

            return routes;
        };

        self.goHome = function () {
            Emby.Page.show(Emby.PluginManager.mapPath(self, 'home.html'));
        };

        self.load = function () {
        };

        self.unload = function () {
        };
    }
});
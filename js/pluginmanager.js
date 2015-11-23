(function (globalScope) {

    function pluginManager() {

        var self = this;
        var plugins = [];

        // In lieu of automatic discovery, plugins will register dynamic objects
        // Each object will have the following properties:
        // name
        // type (theme, screensaver, etc)
        self.register = function (obj) {

            plugins.push(obj);
            Events.trigger(self, 'registered', [obj]);
        };

        self.ofType = function (type) {

            return plugins.filter(function (o) {
                return o.type == type;
            });
        };

        self.plugins = function () {
            return plugins;
        };

        self.mapPath = function (plugin, path) {

            if (typeof plugin === 'string') {
                plugin = plugins.filter(function (p) {
                    return p.packageName == plugin;
                })[0];
            }

            return plugin.baseUrl + '/' + path;
        };

        // TODO: replace with each plugin version
        var cacheParam = new Date().getTime();

        self.mapUrl = function (plugin, path) {

            var url = self.mapPath(plugin, path);

            url += url.indexOf('?') == -1 ? '?' : '&';
            url += 'v=' + cacheParam;
        };
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PluginManager = new pluginManager();

})(this);
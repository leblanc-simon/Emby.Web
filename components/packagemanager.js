define(['appSettings', 'pluginManager'], function (appSettings, pluginManager) {

    function packageManager() {

        var self = this;
        var packages = [];

        self.packages = function () {
            return packages;
        };

        self.install = function (url) {

            return url;
        };

        self.uninstall = function () {

            // todo
        };

        function loadPackage(url) {

        }

        function loadInstalledPackages() {

            var manifestUrls = JSON.parse(appSettings.get('installedpackages') || '[]');

            return Promise.all(manifestUrls.map(loadPackage));
        }

        loadInstalledPackages();
    }

    return new packageManager();
});
define(['appSettings', 'pluginManager'], function (appSettings, pluginManager) {

    function packageManager() {

        var self = this;
        var packages = [];

        self.packages = function () {
            return packages.splice(0);
        };

        self.install = function (url) {

            return Promise.resolve({});
            var manifestUrls = JSON.parse(appSettings.get('installedpackages') || '[]');
            manifestUrls.push(url);
            appSettings.set('installedpackages', JSON.stringify(manifestUrls));

            return loadPackage(url);
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
define(['appSettings', 'pluginManager'], function (appSettings, pluginManager) {

    function packageManager() {

        var self = this;
        var settingsKey = 'installedpackages1';

        var packages = [];

        self.packages = function () {
            return packages.slice(0);
        };

        function addPackage(pkg) {

            packages = packages.filter(function (p) {

                return p.name != pkg.name;
            });

            packages.push(pkg);
        }

        self.install = function (url) {

            return loadPackage(url).then(function(pkg) {
                
                var manifestUrls = JSON.parse(appSettings.get(settingsKey) || '[]');

                if (manifestUrls.indexOf(url) == -1) {
                    manifestUrls.push(url);
                    appSettings.set(settingsKey, JSON.stringify(manifestUrls));
                }

                return pkg;
            });
        };

        self.uninstall = function (name) {

            var pkg = packages.filter(function (p) {

                return p.name == name;
            })[0];

            if (pkg) {

                packages = packages.filter(function (p) {

                    return p.name != name;
                });

                var manifestUrls = JSON.parse(appSettings.get(settingsKey) || '[]');

                manifestUrls = manifestUrls.filter(function (i) {
                    return i != pkg.url;
                });

                appSettings.set(settingsKey, JSON.stringify(manifestUrls));
            }

            return Promise.resolve();
        };

        self.init = function () {
            var manifestUrls = JSON.parse(appSettings.get(settingsKey) || '[]');

            return Promise.all(manifestUrls.map(loadPackage)).then(function() {
                return Promise.resolve();
            }, function () {
                return Promise.resolve();
            });
        };

        function loadPackage(url) {

            return new Promise(function (resolve, reject) {

                var xhr = new XMLHttpRequest();
                var originalUrl = url;
                url += url.indexOf('?') == -1 ? '?' : '&';
                url += 't=' + new Date().getTime();

                xhr.open('GET', url, true);

                xhr.onload = function (e) {
                    if (this.status < 400) {

                        var pkg = JSON.parse(this.response);
                        pkg.url = originalUrl;

                        addPackage(pkg);

                        var plugins = pkg.plugins || [];
                        if (pkg.plugin) {
                            plugins.push(pkg.plugin);
                        }
                        var promises = plugins.map(function (pluginUrl) {
                            return pluginManager.loadPlugin(mapPath(originalUrl, pluginUrl));
                        });
                        Promise.all(promises).then(resolve, resolve);

                    } else {
                        reject();
                    }
                };

                xhr.onerror = reject;

                xhr.send();
            });
        }

        function mapPath(packageUrl, pluginUrl) {

            packageUrl = packageUrl.substring(0, packageUrl.lastIndexOf('/'));

            packageUrl += '/';
            packageUrl += pluginUrl;

            return packageUrl;
        }
    }

    return new packageManager();
});
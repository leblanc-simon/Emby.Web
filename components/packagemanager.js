define(['appSettings', 'pluginManager'], function (appSettings, pluginManager) {

    function packageManager() {

        var self = this;
        var settingsKey = 'installedpackages';

        var packages = [];

        self.packages = function () {
            return packages.slice(0);
        };

        function addPackage(pkg) {

            if (!packages.filter(function (p) {

                return p.name == pkg.name;

            }).length) {
                packages.push(pkg);
                return true;
            }

            return false;
        }

        self.install = function (url) {

            var manifestUrls = JSON.parse(appSettings.get(settingsKey) || '[]');

            if (manifestUrls.indexOf(url) == -1) {
                manifestUrls.push(url);
                appSettings.set(settingsKey, JSON.stringify(manifestUrls));
            }

            return loadPackage(url);
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

            return Promise.all(manifestUrls.map(loadPackage));
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
                        if (addPackage(pkg)) {
                            var promises = (pkg.plugins || []).map(function (pluginUrl) {
                                return pluginManager.loadPlugin(mapPath(originalUrl, pluginUrl));
                            });
                            Promise.all(promises).then(resolve, resolve);
                        } else {
                            resolve(pkg);
                        }

                    } else {
                        reject();
                    }
                };

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
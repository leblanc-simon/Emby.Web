(function (globalScope, document) {

    var currentTheme;
    var currentThemeDependencies = [];

    function getCurrentTheme() {
        return currentTheme;
    }

    function loadTheme(packageName, callback) {

        var theme = Emby.PluginManager.plugins().filter(function (p) {
            return p.packageName == packageName;
        })[0];

        if (currentTheme) {

            if (currentTheme.packageName == packageName) {
                // Nothing to do, it's already the active theme
                callback(currentTheme);
                return;
            }
            unloadTheme(currentTheme);
        }

        var deps = theme.getDependencies();
        require(deps, function () {

            currentThemeDependencies = deps;

            var translations = theme.getTranslations ? theme.getTranslations() : [];

            Globalize.loadTranslations({

                name: theme.packageName,
                translations: translations

            }).then(function () {
                loadThemeHeader(theme, callback);
            });
        });
    }

    function unloadTheme(theme) {

        Emby.Backdrop.clear();

        console.log('Unloading theme: ' + theme.name);

        // TODO: unload css

        theme.unload();

        document.dispatchEvent(new CustomEvent("themeunload", {
            detail: {
                name: theme.name
            }
        }));
    }

    function loadThemeHeader(theme, callback) {

        getThemeHeader(theme).then(function (headerHtml) {

            document.querySelector('.themeHeader').innerHTML = headerHtml;

            //document.querySelector('.themeContent').innerHTML = theme.getPageContent();
            currentTheme = theme;
            theme.load();
            callback(theme);
        });
    }

    var cacheParam = new Date().getTime();

    function getThemeHeader(theme) {

        return new Promise(function (resolve, reject) {

            if (!theme.getHeaderTemplate) {
                resolve('');
                return;
            }

            var xhr = new XMLHttpRequest();

            var url = theme.getHeaderTemplate();
            url += url.indexOf('?') == -1 ? '?' : '&';
            url += 'v=' + cacheParam;

            xhr.open('GET', url, true);

            xhr.onload = function (e) {
                if (this.status < 400) {
                    resolve(this.response);
                } else {
                    resolve('');
                }
            };

            xhr.send();
        });
    }

    function loadUserTheme() {

        loadTheme('defaulttheme', function (theme) {
            Emby.Page.goHome();
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.ThemeManager = {
        getCurrentTheme: getCurrentTheme,
        loadTheme: loadTheme,
        loadUserTheme: loadUserTheme
    };

})(this, document);

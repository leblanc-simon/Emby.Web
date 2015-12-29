(function (globalScope) {

    var connectionManager;

    function defineRoute(newRoute, packageName) {

        var baseRoute = Emby.Page.baseUrl();

        var path = newRoute.path;

        path = path.replace(baseRoute, '');

        console.log('Defining route: ' + path);

        newRoute.packageName = packageName || 'core';
        Emby.Page.addRoute(path, newRoute);
    }

    function defineCoreRoutes() {

        console.log('Defining core routes');

        var baseRoute = window.location.pathname.replace('/index.html', '');
        if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
            baseRoute = baseRoute.substring(0, baseRoute.length - 1);
        }

        console.log('Setting page base to ' + baseRoute);

        page.base(baseRoute);

        var deps = ['startup/startup'];
        var startupRoot = '/startup/';

        var suffix = "";

        defineRoute({
            path: startupRoot + 'login.html',
            id: 'login',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'manuallogin.html',
            contentPath: startupRoot + 'manuallogin' + suffix + '.html',
            id: 'manuallogin',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'welcome.html',
            contentPath: startupRoot + 'welcome' + suffix + '.html',
            id: 'welcome',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'connectlogin.html',
            contentPath: startupRoot + 'connectlogin' + suffix + '.html',
            id: 'connectlogin',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'manualserver.html',
            contentPath: startupRoot + 'manualserver' + suffix + '.html',
            id: 'manualserver',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: startupRoot + 'selectserver.html',
            id: 'selectserver',
            transition: 'slide',
            dependencies: deps
        });

        defineRoute({
            path: '/settings/settings.html',
            id: 'settings',
            transition: 'slide',
            dependencies: ['settings/settings', 'css!settings/settings.css']
        });

        defineRoute({
            path: '/settings/playback/playbacksettings.html',
            id: 'playbacksettings',
            transition: 'slide',
            dependencies: ['settings/playback/playbacksettings',
                    'emby-dropdown-menu'],
            type: 'settings',
            title: 'General',
            category: 'Playback',
            thumbImage: ''
        });

        defineRoute({
            path: '/index.html',
            id: 'index',
            isDefaultRoute: true,
            transition: 'slide',
            dependencies: []
        });
    }

    function definePluginRoutes() {

        console.log('Defining plugin routes');

        var plugins = Emby.PluginManager.plugins();

        for (var i = 0, length = plugins.length; i < length; i++) {

            var plugin = plugins[i];
            if (plugin.getRoutes) {
                plugin.getRoutes().forEach(function (route) {
                    defineRoute(route, plugin.packageName);
                });
            }
        }
    }

    function getCapabilities(apphost) {

        var caps = apphost.capabilities();

        // Full list
        // https://github.com/MediaBrowser/MediaBrowser/blob/master/MediaBrowser.Model/Session/GeneralCommand.cs
        caps.SupportedCommands = [
            "GoHome",
            "GoToSettings",
            "VolumeUp",
            "VolumeDown",
            "Mute",
            "Unmute",
            "ToggleMute",
            "SetVolume",
            "SetAudioStreamIndex",
            "SetSubtitleStreamIndex",
            "DisplayContent",
            "GoToSearch",
            "DisplayMessage"
        ];

        caps.SupportsMediaControl = true;
        caps.SupportedLiveMediaTypes = caps.PlayableMediaTypes;

        return caps;
    }

    function createConnectionManager() {

        return new Promise(function (resolve, reject) {

            require(['apphost', 'credentialprovider'], function (apphost, credentialProvider) {

                var credentialProviderInstance = new credentialProvider();

                if (window.location.href.indexOf('clear=1') != -1) {
                    credentialProviderInstance.clear();
                }

                apphost.appInfo().then(function (appInfo) {

                    connectionManager = new MediaBrowser.ConnectionManager(credentialProviderInstance, appInfo.appName, appInfo.appVersion, appInfo.deviceName, appInfo.deviceId, getCapabilities(apphost), window.devicePixelRatio);

                    define('connectionManager', [], function () {
                        return connectionManager;
                    });

                    resolve();
                });
            });
        });
    }

    function initRequire(customPaths) {

        console.log('Initializing requirejs');

        var bowerPath = "bower_components";
        var embyWebComponentsBowerPath = bowerPath + '/emby-webcomponents';

        var paths = {
            alert: "components/alert",
            confirm: "components/confirm",
            toast: "components/toast",
            loading: "components/loading/loading",
            dialog: "components/dialog",
            soundeffects: "components/soundeffects",
            apphost: customPaths.apphost || "components/apphost",
            filesystem: customPaths.filesystem || "components/filesystem",
            screensaverManager: "js/screensavermanager",
            viewManager: "components/viewmanager",
            slyScroller: "components/slyscroller",
            appsettings: "components/appsettings",
            tvguide: "components/tvguide/guide",
            actionsheet: "components/actionsheet/actionsheet",
            playmenu: "components/playmenu",
            datetime: embyWebComponentsBowerPath + "/datetime",
            inputmanager: "components/inputmanager",
            alphapicker: "components/alphapicker/alphapicker",
            paperdialoghelper: "components/paperdialoghelper/paperdialoghelper",
            slideshow: "components/slideshow/slideshow",
            browserdeviceprofile: embyWebComponentsBowerPath + "/browserdeviceprofile",
            browser: embyWebComponentsBowerPath + "/browser",
            qualityoptions: embyWebComponentsBowerPath + "/qualityoptions",
            isMobile: "bower_components/isMobile/isMobile.min",
            howler: 'bower_components/howler.js/howler.min',
            screenfull: 'bower_components/screenfull/dist/screenfull',
            events: 'bower_components/emby-apiclient/events',
            pluginmanager: 'components/pluginmanager',
            playbackmanager: 'components/playbackmanager',
            credentialprovider: 'bower_components/emby-apiclient/credentials',
            apiclient: 'bower_components/emby-apiclient/apiclient',
            connectservice: 'bower_components/emby-apiclient/connectservice',
            serverdiscovery: customPaths.serverdiscovery || "bower_components/emby-apiclient/serverdiscovery",
            wakeonlan: customPaths.wakeonlan || "bower_components/emby-apiclient/wakeonlan",
            peoplecardbuilder: 'components/cards/peoplecardbuilder',
            chaptercardbuilder: 'components/cards/chaptercardbuilder'
        };

        paths.hlsjs = bowerPath + "/hls.js/dist/hls.min";
        paths.viewcontainer = 'components/viewcontainer';

        var urlArgs = "t=" + new Date().getTime();

        var sha1Path = bowerPath + "/cryptojslib/components/sha1-min";
        var md5Path = bowerPath + "/cryptojslib/components/md5-min";
        var shim = {};

        shim[sha1Path] = {
            deps: [bowerPath + "/cryptojslib/components/core-min"]
        };

        shim[md5Path] = {
            deps: [bowerPath + "/cryptojslib/components/core-min"]
        };

        var config = {

            waitSeconds: 30,
            urlArgs: urlArgs,

            paths: paths,
            map: {
                '*': {
                    'css': embyWebComponentsBowerPath + '/requirecss',
                    'html': embyWebComponentsBowerPath + '/requirehtml'
                }
            },
            shim: shim
        };

        var baseRoute = window.location.href.split('?')[0].replace('/index.html', '');
        if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
            baseRoute = baseRoute.substring(0, baseRoute.length - 1);
        }

        console.log('Setting require baseUrl to ' + baseRoute);

        config.baseUrl = baseRoute;

        requirejs.config(config);

        define("cryptojs-sha1", [sha1Path]);
        define("cryptojs-md5", [md5Path]);

        //define("type", ["bower_components/type/dist/type"]);
        define("Sly", [bowerPath + "/sly/src/sly"], function () {
            return globalScope.Sly;
        });

        define("paper-base", ["css!style/paperstyles.css"]);
        define("paper-spinner", ["html!" + bowerPath + "/paper-spinner/paper-spinner.html", 'paper-base']);
        define("paper-toast", ["html!" + bowerPath + "/paper-toast/paper-toast.html", 'paper-base']);
        define("paper-slider", ["html!" + bowerPath + "/paper-slider/paper-slider.html", 'paper-base']);
        define("paper-tabs", ["html!" + bowerPath + "/paper-tabs/paper-tabs.html", 'paper-base']);
        define("paper-menu", ["html!" + bowerPath + "/paper-menu/paper-menu.html", 'paper-base']);
        define("paper-dialog", ["html!" + bowerPath + "/paper-dialog/paper-dialog.html", 'paper-base']);
        define("paper-dialog-scrollable", ["html!" + bowerPath + "/paper-dialog-scrollable/paper-dialog-scrollable.html", 'paper-base']);
        define("paper-button", ["html!" + bowerPath + "/paper-button/paper-button.html", 'paper-base']);
        define("paper-icon-button", ["html!" + bowerPath + "/paper-icon-button/paper-icon-button.html", 'paper-base']);
        define("paper-drawer-panel", ["html!" + bowerPath + "/paper-drawer-panel/paper-drawer-panel.html", 'paper-base']);
        define("paper-radio-group", ["html!" + bowerPath + "/paper-radio-group/paper-radio-group.html", 'paper-base']);
        define("paper-radio-button", ["html!" + bowerPath + "/paper-radio-button/paper-radio-button.html", 'paper-base']);
        define("neon-animated-pages", ["html!" + bowerPath + "/neon-animation/neon-animated-pages.html", 'paper-base']);
        define("paper-toggle-button", ["html!" + bowerPath + "/paper-toggle-button/paper-toggle-button.html", 'paper-base']);

        define("slide-right-animation", ["html!" + bowerPath + "/neon-animation/animations/slide-right-animation.html"]);
        define("slide-left-animation", ["html!" + bowerPath + "/neon-animation/animations/slide-left-animation.html"]);
        define("slide-from-right-animation", ["html!" + bowerPath + "/neon-animation/animations/slide-from-right-animation.html"]);
        define("slide-from-left-animation", ["html!" + bowerPath + "/neon-animation/animations/slide-from-left-animation.html"]);
        define("paper-textarea", ["html!" + bowerPath + "/paper-input/paper-textarea.html", 'paper-base']);
        define("paper-item", ["html!" + bowerPath + "/paper-item/paper-item.html", 'paper-base']);
        define("paper-checkbox", ["html!" + bowerPath + "/paper-checkbox/paper-checkbox.html", 'paper-base']);
        define("fade-in-animation", ["html!" + bowerPath + "/neon-animation/animations/fade-in-animation.html"]);
        define("fade-out-animation", ["html!" + bowerPath + "/neon-animation/animations/fade-out-animation.html"]);
        define("scale-up-animation", ["html!" + bowerPath + "/neon-animation/animations/scale-up-animation.html"]);
        define("scale-down-animation", ["html!" + bowerPath + "/neon-animation/animations/scale-down-animation.html"]);
        define("paper-fab", ["html!" + bowerPath + "/paper-fab/paper-fab.html", 'paper-base']);
        define("paper-progress", ["html!" + bowerPath + "/paper-progress/paper-progress.html", 'paper-base']);
        define("paper-input", ["html!" + bowerPath + "/paper-input/paper-input.html", 'paper-base']);
        define("paper-icon-item", ["html!" + bowerPath + "/paper-item/paper-icon-item.html", 'paper-base']);
        define("paper-item-body", ["html!" + bowerPath + "/paper-item/paper-item-body.html", 'paper-base']);
        define("paper-menu-item", ["html!" + bowerPath + "/paper-menu/paper-menu-item.html", 'paper-base']);
        define("paper-dropdown-menu", ["html!" + bowerPath + "/paper-dropdown-menu/paper-dropdown-menu.html", 'paper-base']);
        define("emby-dropdown-menu", ["html!" + bowerPath + "/emby-dropdown-menu/emby-dropdown-menu.html", 'paper-base']);
        define("paper-listbox", ["html!" + bowerPath + "/paper-listbox/paper-listbox.html", 'paper-base']);
    }

    function loadApiClientDependencies(callback) {

        var list = [
           'bower_components/emby-apiclient/connectionmanager',
           'bower_components/emby-apiclient/store'
        ];

        require(list, function (connectionManagerExports) {

            window.MediaBrowser = window.MediaBrowser || {};
            for (var i in connectionManagerExports) {
                MediaBrowser[i] = connectionManagerExports[i];
            }
            callback();
        });
    }

    function loadCoreDependencies(callback) {

        console.log('Loading core dependencies');

        loadApiClientDependencies(function () {

            var list = [
             'bower_components/page.js/page.js',
             'components/router',
             'pluginmanager',
             'css!style/style.css',
             'js/globalize',
             'js/thememanager',
             'js/focusmanager',
             'js/imageloader',
             'js/backdrops',
             'js/dom',
             'js/shortcuts'
            ];

            list.push('screensaverManager');

            if (!('registerElement' in document && 'content' in document.createElement('template'))) {
                list.push("bower_components/webcomponentsjs/webcomponents-lite.min");
            }

            if (!globalScope.Promise) {
                list.push('bower_components/native-promise-only/lib/npo.src');
            }

            if (!globalScope.fetch) {
                list.push('bower_components/fetch/fetch');
            }

            require(list, function (pageJs, pageObjects, pluginmanager) {

                globalScope.page = pageJs;
                globalScope.Emby.Page = pageObjects;
                globalScope.Emby.TransparencyLevel = pageObjects.TransparencyLevel;
                globalScope.Emby.PluginManager = pluginmanager;

                loadSecondLevelCoreDependencies(callback);
            });
        });
    }

    function loadSecondLevelCoreDependencies(callback) {

        var secondLevelDeps = [];

        // needs to be after the plugin manager
        secondLevelDeps.push('playbackmanager');

        secondLevelDeps.push('neon-animated-pages');

        // Second level dependencies that have to be loaded after the first set
        require(secondLevelDeps, function (playbackmanager) {

            globalScope.Emby.PlaybackManager = playbackmanager;
            callback();
        });
    }

    function loadPlugins(externalPlugins) {

        console.log('Loading installed plugins');

        // Load installed plugins

        var list = [
        'plugins/defaulttheme/plugin.js',
        'plugins/logoscreensaver/plugin.js',
        'plugins/backdropscreensaver/plugin.js',
        'plugins/keyboard/plugin.js',
        'plugins/htmlvideoplayer/plugin.js',
        'plugins/htmlaudioplayer/plugin.js',
        'plugins/defaultsoundeffects/plugin.js'
        ];

        list.push('plugins/wmctheme/plugin.js');

        for (var i = 0, length = externalPlugins.length; i < length; i++) {
            list.push(externalPlugins[i]);
        }

        return Promise.all(list.map(loadPlugin));
    }

    function loadPlugin(url) {

        console.log('Loading plugin: ' + url);

        return new Promise(function (resolve, reject) {

            require([url], function (pluginFactory) {

                var plugin = new pluginFactory();

                var urlLower = url.toLowerCase();
                if (urlLower.indexOf('http:') == -1 && urlLower.indexOf('https:') == -1 && urlLower.indexOf('file:') == -1) {
                    if (url.indexOf(Emby.Page.baseUrl()) != 0) {

                        url = Emby.Page.baseUrl() + '/' + url;
                    }
                }

                var separatorIndex = Math.max(url.lastIndexOf('/'), url.lastIndexOf('\\'));
                plugin.baseUrl = url.substring(0, separatorIndex);

                Emby.PluginManager.register(plugin);

                if (plugin.type != 'theme') {
                    var translations = plugin.getTranslations ? plugin.getTranslations() : [];
                    Globalize.loadTranslations({
                        name: plugin.packageName,
                        translations: translations
                    }).then(resolve);
                } else {
                    resolve();
                }
            });
        });
    }

    function loadDefaultTheme(callback) {

        Emby.ThemeManager.loadTheme('defaulttheme', callback);
    }

    function start() {

        var startInfo = globalScope.appStartInfo || {};

        initRequire(startInfo.paths || {});

        loadCoreDependencies(function () {

            loadPlugins(startInfo.plugins || []).then(function () {

                defineCoreRoutes();
                definePluginRoutes();

                createConnectionManager().then(function () {

                    require(startInfo.scripts || [], loadPresentation);
                });
            });
        });
    }

    function loadPresentation() {

        var presentationDependencies = [];

        presentationDependencies.push('events');
        presentationDependencies.push('js/models');
        presentationDependencies.push('js/soundeffectplayer');
        presentationDependencies.push('js/thememediaplayer');

        presentationDependencies.push('js/input/gamepad');
        presentationDependencies.push('js/input/mouse');
        presentationDependencies.push('js/input/onscreenkeyboard');
        presentationDependencies.push('js/input/keyboard');

        presentationDependencies.push('js/controlbox');

        require(presentationDependencies, function (events) {

            window.Events = events;

            console.log('Loading presentation');

            // Start by loading the default theme. Once a user is logged in we can change the theme based on settings
            loadDefaultTheme(function () {

                document.documentElement.classList.remove('preload');

                Emby.Page.start();

                document.dispatchEvent(new CustomEvent("appready", {}));

                loadCoreDictionary();
            });
        });
    }

    function loadCoreDictionary() {

        var baseUrl = Emby.Page.baseUrl() + '/strings/';

        var languages = ['en-us'];

        var translations = languages.map(function (i) {
            return {
                lang: i,
                path: baseUrl + i + '.json'
            };
        });

        Globalize.loadTranslations({
            name: 'core',
            translations: translations
        });
    }

    function logout() {

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            connectionManager.logout().then(function () {
                Emby.Page.redirectToLogin();
            });
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.App = {
        logout: logout
    };

    start();

})(this);
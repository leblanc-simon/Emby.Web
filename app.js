(function (globalScope) {

    var connectionManager;

    function defineRoute(newRoute) {

        var baseRoute = Emby.Page.baseUrl();

        var path = newRoute.path;

        path = path.replace(baseRoute, '');

        Logger.log('Defining route: ' + path);

        Emby.Page.addRoute(path, newRoute);
    }

    function defineRoutes(routes) {

        for (var i = 0, length = routes.length; i < length; i++) {

            var currentRoute = routes[i];

            defineRoute(routes[i]);
        }
    }

    function defineCoreRoutes() {

        Logger.log('Defining core routes');

        var baseRoute = window.location.pathname.replace('/index.html', '');
        if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
            baseRoute = baseRoute.substring(0, baseRoute.length - 1);
        }

        console.log('Setting page base to ' + baseRoute);

        page.base(baseRoute);

        var deps = ['startup/startup'];
        var startupRoot = '/startup/';

        var suffix = enableWebComponents() ? "" : "-lite";

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
            dependencies: ['settings/settings']
        });

        defineRoute({
            path: '/index.html',
            id: 'index',
            isDefaultRoute: true,
            transition: 'slide',
            dependencies: []
        });
    }

    function replaceAll(str, find, replace) {

        return str.split(find).join(replace);
    }

    function definePluginRoutes() {

        Logger.log('Defining plugin routes');

        var plugins = Emby.PluginManager.plugins();

        for (var i = 0, length = plugins.length; i < length; i++) {

            var plugin = plugins[i];
            if (plugin.getRoutes) {
                defineRoutes(plugin.getRoutes());
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

            require(['apphost'], function (apphost) {

                var credentialProvider = new MediaBrowser.CredentialProvider();

                if (window.location.href.indexOf('clear=1') != -1) {
                    credentialProvider.clear();
                }

                apphost.appInfo().then(function (appInfo) {

                    connectionManager = new MediaBrowser.ConnectionManager(Logger, credentialProvider, appInfo.appName, appInfo.appVersion, appInfo.deviceName, appInfo.deviceId, getCapabilities(apphost));

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

        var componentType = enableWebComponents() ? 'polymer' : 'default';

        var paths = {
            alert: "components/" + componentType + "/alert",
            confirm: "components/" + componentType + "/confirm",
            toast: "components/" + componentType + "/toast",
            loading: "components/" + componentType + "/loading",
            dialog: "components/" + componentType + "/dialog",
            soundeffects: "components/soundeffects",
            apphost: customPaths.apphost || "components/apphost",
            filesystem: customPaths.filesystem || "components/filesystem",
            screensaverManager: "js/screensavermanager",
            viewManager: "components/viewmanager",
            slyScroller: "components/slyscroller",
            appsettings: "components/appsettings",
            tvguide: "components/tvguide/guide",
            actionsheet: "components/actionsheet",
            playmenu: "components/playmenu",
            inputreceiver: "components/inputreceiver",
            alphapicker: "components/alphapicker/alphapicker",
            paperdialoghelper: "components/paperdialoghelper",
            slideshow: "components/slideshow/slideshow",
            hlsjs: "components/hls.min",
            browserdeviceprofile: "components/browserdeviceprofile",
            howler: 'bower_components/howler.js/howler.min',
            screenfull: 'bower_components/screenfull/dist/screenfull'
        };

        if (enableWebComponents()) {
            paths.viewcontainer = 'components/viewcontainer';
        } else {
            paths.viewcontainer = 'components/viewcontainer-lite';
        }

        var urlArgs = "t=" + new Date().getTime();

        var config = {

            waitSeconds: 30,
            urlArgs: urlArgs,

            paths: paths,
            map: {
                '*': {
                    'css': 'components/requirecss',
                    'html': 'components/requirehtml'
                }
            },
            shim: {
                'bower_components/sly/src/sly': {
                    //These script dependencies should be loaded before loading
                    //backbone.js
                    deps: [],
                    //Once loaded, use the global 'Backbone' as the
                    //module value.
                    exports: 'Sly'
                }
            }
        };

        var baseRoute = window.location.href.split('?')[0].replace('/index.html', '');
        if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
            baseRoute = baseRoute.substring(0, baseRoute.length - 1);
        }

        console.log('Setting require baseUrl to ' + baseRoute);

        config.baseUrl = baseRoute;

        requirejs.config(config);

        define("videoplayerosd", ["components/videoplayerosd"]);

        define("cryptojs-sha1", ["apiclient/sha1"]);
        define("cryptojs-md5", ["apiclient/md5"]);
        define("connectservice", ["apiclient/connectservice"]);
        define("serverdiscovery", ["apiclient/serverdiscovery"]);
        define("wakeonlan", ["apiclient/wakeonlan"]);
        define("type", ["bower_components/type/dist/type"]);
        define("Sly", ["bower_components/sly/src/sly"], function () {
            return window.Sly;
        });

        define("jquery.easing", ["bower_components/jquery.easing/js/jquery.easing.min"]);
        define("nearestElements", ["js/nearest"]);

        define("paper-dialog", ['html!bower_components/paper-dialog/paper-dialog']);
        define("paper-menu", ['html!bower_components/paper-menu/paper-menu']);
        define("paper-button", ['html!bower_components/paper-button/paper-button']);
        define("paper-icon-button", ['html!bower_components/paper-icon-button/paper-icon-button']);
        define("paper-menu-item", ['html!bower_components/paper-menu/paper-menu-item']);
        define("paper-input", ['html!bower_components/paper-input/paper-input']);
        define("paper-fab", ['html!bower_components/paper-fab/paper-fab']);
        define("paper-slider", ['html!bower_components/paper-slider/paper-slider']);

        define("slide-from-right-animation", ['html!bower_components/neon-animation/animations/slide-from-right-animation.html']);
        define("slide-left-animation", ['html!bower_components/neon-animation/animations/slide-left-animation.html']);
        define("slide-from-left-animation", ['html!bower_components/neon-animation/animations/slide-from-left-animation.html']);
        define("slide-right-animation", ['html!bower_components/neon-animation/animations/slide-right-animation.html']);
        define("hero-animation", ['html!bower_components/neon-animation/animations/hero-animation.html']);
        define("ripple-animation", ['html!bower_components/neon-animation/animations/ripple-animation.html']);
        define("reverse-ripple-animation", ['html!bower_components/neon-animation/animations/reverse-ripple-animation.html']);
        define("fade-in-animation", ['html!bower_components/neon-animation/animations/fade-in-animation.html']);
        define("fade-out-animation", ['html!bower_components/neon-animation/animations/fade-out-animation.html']);

        define("scale-up-animation", ['html!bower_components/neon-animation/animations/scale-up-animation.html']);
        define("scale-down-animation", ['html!bower_components/neon-animation/animations/scale-down-animation.html']);
    }

    function enableWebComponents() {

        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('maxthon') != -1) {
            return false;
        }

        return userAgent.indexOf('chrome') != -1 || userAgent.indexOf('firefox') != -1;
    }

    function loadApiClientDependencies(callback) {

        var list = [
           'bower_components/bean/bean.min',
           'apiclient/logger',
           'apiclient/credentials',
           'apiclient/store',
           'apiclient/events',
           'apiclient/apiclient',
           'apiclient/connectionmanager'
        ];

        require(list, function (bean) {

            window.bean = bean;

            callback();
        });
    }

    function loadCoreDependencies(callback) {

        console.log('Loading core dependencies');

        loadApiClientDependencies(function () {

            var list = [
             'bower_components/page.js/page.js',
             'css!style/style.css',
             'js/pluginmanager',
             'js/routes',
             'js/globalize',
             'js/thememanager',
             'js/focusmanager',
             'js/imageloader',
             'js/backdrops',
             'js/dom',
             'js/datetime',
             'js/shortcuts'
            ];

            list.push('screensaverManager');

            if (enableWebComponents() && !('registerElement' in document && 'content' in document.createElement('template'))) {
                list.push("bower_components/webcomponentsjs/webcomponents-lite.min");
            }

            if (!globalScope.Promise) {
                list.push('bower_components/native-promise-only/lib/npo.src');
            }

            if (!globalScope.fetch) {
                list.push('bower_components/fetch/fetch');
            }

            require(list, function (page) {

                window.page = page;

                var secondLevelDeps = [];

                // needs to be after the plugin manager
                secondLevelDeps.push('js/playbackmanager');

                if (enableWebComponents()) {
                    secondLevelDeps.push('html!bower_components/neon-animation/neon-animated-pages.html');
                }

                // Second level dependencies that have to be loaded after the first set
                require(secondLevelDeps, callback);
            });
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

        if (enableWebComponents()) {
            list.push('plugins/wmctheme/plugin.js');
        }

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

                if (url.indexOf() != 0) {

                    url = Emby.Page.baseUrl() + '/' + url;
                }

                plugin.baseUrl = url.substring(0, url.lastIndexOf('/'));

                Emby.PluginManager.register(plugin);

                resolve();
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

        presentationDependencies.push('js/models');
        presentationDependencies.push('js/soundeffectplayer');
        presentationDependencies.push('js/thememediaplayer');

        presentationDependencies.push('js/input/gamepad');
        presentationDependencies.push('js/input/mouse');
        presentationDependencies.push('js/input/onscreenkeyboard');
        presentationDependencies.push('js/input/keyboard');

        presentationDependencies.push('js/controlbox');

        require(presentationDependencies, function () {

            Logger.log('Loading presentation');

            // Start by loading the default theme. Once a user is logged in we can change the theme based on settings
            loadDefaultTheme(function () {

                document.documentElement.classList.remove('preload');

                Emby.Page.start();

                document.dispatchEvent(new CustomEvent("appready", {}));
            });
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
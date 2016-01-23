(function (globalScope) {

    var connectionManager;

    function defineRoute(newRoute, dictionary) {

        var baseRoute = Emby.Page.baseUrl();

        var path = newRoute.path;

        path = path.replace(baseRoute, '');

        console.log('Defining route: ' + path);

        newRoute.dictionary = newRoute.dictionary || dictionary || 'core';
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

        var startupRoot = '/startup/';

        defineRoute({
            path: startupRoot + 'login.html',
            transition: 'slide',
            controller: 'startup/login'
        });

        defineRoute({
            path: startupRoot + 'manuallogin.html',
            contentPath: startupRoot + 'manuallogin.html',
            transition: 'slide',
            controller: 'startup/manuallogin'
        });

        defineRoute({
            path: startupRoot + 'welcome.html',
            contentPath: startupRoot + 'welcome.html',
            transition: 'slide',
            controller: 'startup/welcome'
        });

        defineRoute({
            path: startupRoot + 'connectlogin.html',
            contentPath: startupRoot + 'connectlogin.html',
            transition: 'slide',
            controller: 'startup/connectlogin'
        });

        defineRoute({
            path: startupRoot + 'manualserver.html',
            contentPath: startupRoot + 'manualserver.html',
            transition: 'slide',
            controller: 'startup/manualserver'
        });

        defineRoute({
            path: startupRoot + 'selectserver.html',
            transition: 'slide',
            controller: 'startup/selectserver'
        });

        defineRoute({
            path: '/settings/settings.html',
            transition: 'slide',
            dependencies: ['css!settings/settings.css'],
            controller: 'settings/settings'
        });

        defineRoute({
            path: '/settings/playback.html',
            transition: 'slide',
            dependencies: ['emby-dropdown-menu'],
            controller: 'settings/playback',
            type: 'settings',
            title: 'General',
            category: 'Playback',
            thumbImage: '',
            order: -1
        });

        defineRoute({
            path: '/settings/display.html',
            transition: 'slide',
            dependencies: ['emby-dropdown-menu'],
            controller: 'settings/display',
            type: 'settings',
            title: 'General',
            category: 'Display',
            thumbImage: '',
            order: -1
        });

        defineRoute({
            path: '/index.html',
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

    function defineConnectionManager(connectionManager) {
        define('connectionManager', [], function () {
            return connectionManager;
        });
    }

    function createConnectionManager() {

        return new Promise(function (resolve, reject) {

            require(['apphost', 'credentialprovider', 'events'], function (apphost, credentialProvider, events) {
                var credentialProviderInstance = new credentialProvider();

                if (window.location.href.indexOf('clear=1') != -1) {
                    credentialProviderInstance.clear();
                }

                apphost.appInfo().then(function (appInfo) {

                    connectionManager = new MediaBrowser.ConnectionManager(credentialProviderInstance, appInfo.appName, appInfo.appVersion, appInfo.deviceName, appInfo.deviceId, getCapabilities(apphost), window.devicePixelRatio);

                    defineConnectionManager(connectionManager);
                    bindConnectionManagerEvents(connectionManager, events);
                    resolve();
                });
            });
        });
    }

    var localApiClient;

    function bindConnectionManagerEvents(connectionManager, events) {

        connectionManager.currentLoggedInServer = function () {
            var server = localApiClient ? localApiClient.serverInfo() : null;

            if (server) {
                if (server.UserId && server.AccessToken) {
                    return server;
                }
            }

            return null;
        };

        connectionManager.currentApiClient = function () {

            if (!localApiClient) {
                var server = connectionManager.getLastUsedServer();
                localApiClient = connectionManager.getApiClient(server.Id);
            }
            return localApiClient;
        };

        events.on(connectionManager, 'apiclientcreated', function (e, newApiClient) {

            //$(newApiClient).on("websocketmessage", Dashboard.onWebSocketMessageReceived).on('requestfail', Dashboard.onRequestFail);
        });

        events.on(connectionManager, 'localusersignedin', function (e, user) {

            localApiClient = connectionManager.getApiClient(user.ServerId);

            document.dispatchEvent(new CustomEvent("usersignedin", {
                detail: {
                    user: user,
                    apiClient: localApiClient
                }
            }));
        });

        events.on(connectionManager, 'localusersignedout', function (e) {

            document.dispatchEvent(new CustomEvent("usersignedout", {}));
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
            shell: customPaths.shell || "components/shell",
            filesystem: customPaths.filesystem || "components/filesystem",
            registrationservices: "components/registrationservices/registrationservices",
            screensaverManager: "components/screensavermanager",
            viewManager: "components/viewmanager",
            slyScroller: "components/slyscroller",
            appsettings: "components/appsettings",
            userSettings: "components/usersettings",
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
            visibleinviewport: embyWebComponentsBowerPath + "/visibleinviewport",
            isMobile: "bower_components/isMobile/isMobile.min",
            howler: 'bower_components/howler.js/howler.min',
            screenfull: 'bower_components/screenfull/dist/screenfull',
            events: 'bower_components/emby-apiclient/events',
            pluginManager: 'components/pluginmanager',
            themeManager: 'components/thememanager',
            playbackManager: 'components/playbackmanager',
            credentialprovider: 'bower_components/emby-apiclient/credentials',
            apiclient: 'bower_components/emby-apiclient/apiclient',
            connectservice: 'bower_components/emby-apiclient/connectservice',
            serverdiscovery: customPaths.serverdiscovery || "bower_components/emby-apiclient/serverdiscovery",
            wakeonlan: customPaths.wakeonlan || "bower_components/emby-apiclient/wakeonlan",
            peoplecardbuilder: 'components/cards/peoplecardbuilder',
            chaptercardbuilder: 'components/cards/chaptercardbuilder',
            imageLoader: 'bower_components/emby-webcomponents/images/imagehelper'
        };

        if (navigator.webkitPersistentStorage) {
            paths.imageFetcher = embyWebComponentsBowerPath + "/images/persistentimagefetcher";
        } else {
            paths.imageFetcher = embyWebComponentsBowerPath + "/images/basicimagefetcher";
        }

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

            waitSeconds: 0,
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
        // support hashbang
        baseRoute = baseRoute.split('#')[0];
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

        define('connectionManagerResolver', [], function () {
            return function () {
                return connectionManager;
            };
        });

        define('apiClientResolver', [], function () {
            return function () {
                return connectionManager.currentApiClient();
            };
        });

    }

    function loadApiClientDependencies(callback) {

        var list = [
           'bower_components/emby-apiclient/connectionmanager',
           'bower_components/emby-apiclient/store'
        ];

        require(list, function (connectionManagerExports) {

            globalScope.MediaBrowser = globalScope.MediaBrowser || {};
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
             'css!style/style.css',
             'js/focusmanager',
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

            require(list, function (pageJs, pageObjects) {

                globalScope.page = pageJs;
                globalScope.Emby.Page = pageObjects;
                globalScope.Emby.TransparencyLevel = pageObjects.TransparencyLevel;

                loadSecondLevelCoreDependencies(callback);
            });
        });
    }

    function loadSecondLevelCoreDependencies(callback) {

        var secondLevelDeps = [];

        secondLevelDeps.push('neon-animated-pages');

        // Second level dependencies that have to be loaded after the first set
        require(secondLevelDeps, callback);
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

        for (var i = 0, length = externalPlugins.length; i < length; i++) {
            list.push(externalPlugins[i]);
        }

        return Promise.all(list.map(loadPlugin));
    }

    function loadPlugin(url) {

        return new Promise(function (resolve, reject) {

            require(['pluginManager'], function (pluginManager) {
                pluginManager.loadPlugin(url).then(resolve, reject);
            });
        });
    }

    function loadDefaultTheme(callback) {

        require(['themeManager'], function (themeManager) {
            themeManager.loadTheme('defaulttheme', callback);
        });
    }

    function start() {

        var startInfo = globalScope.appStartInfo || {};

        initRequire(startInfo.paths || {});

        loadCoreDependencies(function () {

            defineCoreRoutes();

            createConnectionManager().then(function () {

                loadPlugins(startInfo.plugins || []).then(function () {

                    definePluginRoutes();

                    require(startInfo.scripts || [], loadPresentation);
                });
            });
        });
    }

    function loadGlobalizaton() {

        return new Promise(function (resolve, reject) {

            require(['components/globalize', 'pluginManager'], function (globalize, pluginManager) {

                globalScope.Globalize = globalize;

                var promises = pluginManager.plugins().filter(function (p) {
                    return p.type != 'theme';

                }).map(function (plugin) {

                    var translations = plugin.getTranslations ? plugin.getTranslations() : [];
                    return Globalize.loadTranslations({
                        name: plugin.packageName,
                        translations: translations
                    });
                });

                Promise.all(promises).then(resolve, reject);
            });
        });
    }

    function loadPresentation() {

        loadGlobalizaton().then(function () {

            var presentationDependencies = [];

            presentationDependencies.push('events');
            presentationDependencies.push('js/models');
            presentationDependencies.push('js/soundeffectplayer');
            presentationDependencies.push('js/thememediaplayer');

            presentationDependencies.push('js/input/gamepad');
            presentationDependencies.push('js/input/mouse');
            presentationDependencies.push('js/input/onscreenkeyboard');
            presentationDependencies.push('js/input/keyboard');
            presentationDependencies.push('js/input/api');

            presentationDependencies.push('components/controlbox');

            require(presentationDependencies, function (events) {

                globalScope.Events = events;

                console.log('Loading presentation');

                // Start by loading the default theme. Once a user is logged in we can change the theme based on settings
                loadDefaultTheme(function () {

                    document.documentElement.classList.remove('preload');

                    Emby.Page.start();

                    document.dispatchEvent(new CustomEvent("appready", {}));

                    loadCoreDictionary();
                });
            });
        });
    }

    function loadCoreDictionary() {

        var baseUrl = Emby.Page.baseUrl() + '/strings/';

        var languages = ['en-US', 'de', 'fr', 'nl', 'pt-BR', 'pt-PT', 'ru', 'sv', 'zh-CN', 'zh-TW'];

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
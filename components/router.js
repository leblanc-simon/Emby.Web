define(['loading', 'viewManager', 'events'], function (loading, viewManager, Events) {

    var connectionManager;

    function isStartup(ctx) {
        var path = ctx.pathname;

        if (path.indexOf('welcome') != -1) {
            return true;
        }

        if (path.indexOf('connectlogin') != -1) {
            return true;
        }

        if (path.indexOf('login') != -1) {
            return true;
        }

        if (path.indexOf('manuallogin') != -1) {
            return true;
        }

        if (path.indexOf('manualserver') != -1) {
            return true;
        }

        if (path.indexOf('selectserver') != -1) {
            return true;
        }

        return false;
    }

    function allowAnonymous(ctx) {

        return isStartup(ctx);
    }

    function redirectToLogin() {

        Emby.Backdrop.clear();

        loading.show();

        connectionManager.connect().then(function (result) {
            handleConnectionResult(result, loading);
        });
    }

    function handleConnectionResult(result, loading) {

        switch (result.State) {

            case MediaBrowser.ConnectionState.SignedIn:
                {
                    loading.hide();
                    Emby.ThemeManager.loadUserTheme();
                }
                break;
            case MediaBrowser.ConnectionState.ServerSignIn:
                {
                    result.ApiClient.getPublicUsers().then(function (users) {

                        if (users.length) {
                            show('/startup/login.html?serverid=' + result.Servers[0].Id);
                        } else {
                            show('/startup/manuallogin.html?serverid=' + result.Servers[0].Id);
                        }
                    });
                }
                break;
            case MediaBrowser.ConnectionState.ServerSelection:
                {
                    show('/startup/selectserver.html');
                }
                break;
            case MediaBrowser.ConnectionState.ConnectSignIn:
                {
                    show('/startup/welcome.html');
                }
                break;
            default:
                break;
        }
    }

    var cacheParam = new Date().getTime();
    function loadContentUrl(ctx, next, route, request) {

        var url = route.contentPath || route.path;

        if (url.toLowerCase().indexOf('http') != 0 && url.indexOf('file:') != 0) {
            url = baseUrl() + '/' + url;
        }

        url += url.indexOf('?') == -1 ? '?' : '&';
        url += 'v=' + cacheParam;

        var xhr = new XMLHttpRequest();
        xhr.onload = xhr.onerror = function () {
            if (this.status < 400) {
                loadContent(ctx, route, this.response, request);
            } else {
                next();
            }
        };
        xhr.onerror = next;
        xhr.open('GET', url, true);
        xhr.send();
    }

    function handleRoute(ctx, next, route) {

        authenticate(ctx, route, function () {
            initRoute(ctx, next, route);
        });
    }

    function initRoute(ctx, next, route) {

        var onInitComplete = function (controllerFactory) {
            sendRouteToViewManager(ctx, next, route, controllerFactory);
        };

        require(route.dependencies || [], function () {

            if (route.controller) {
                require([route.controller], onInitComplete);
            } else {
                onInitComplete();
            }
        });
    }

    function cancelCurrentLoadRequest() {
        var currentRequest = currentViewLoadRequest;
        if (currentRequest) {
            currentRequest.cancel = true;
        }
    }

    var currentViewLoadRequest;
    function sendRouteToViewManager(ctx, next, route, controllerFactory) {

        cancelCurrentLoadRequest();

        var isBackNav = ctx.isBack;

        var currentRequest = {
            id: route.id,
            url: baseUrl() + ctx.path,
            transition: route.transition,
            isBack: isBackNav,
            state: ctx.state,
            type: route.type,
            controllerFactory: controllerFactory,
            options: {
                supportsThemeMedia: route.supportsThemeMedia || false
            }
        };
        currentViewLoadRequest = currentRequest;

        var onNewViewNeeded = function () {
            if (typeof route.path === 'string') {

                loadContentUrl(ctx, next, route, currentRequest);

            } else {
                // ? TODO
                next();
            }
        };

        if (!isBackNav) {
            // Don't force a new view for home due to the back menu
            if (route.type != 'home') {
                onNewViewNeeded();
                return;
            }
        }

        viewManager.tryRestoreView(currentRequest).then(function () {

            // done
            currentRouteInfo = {
                route: route,
                path: ctx.path
            };

        }, onNewViewNeeded);
    }

    var firstConnectionResult;
    function start() {

        loading.show();

        require(['connectionManager'], function (connectionManagerInstance) {

            connectionManager = connectionManagerInstance;

            connectionManager.connect().then(function (result) {

                bindConnectionManagerEvents(connectionManager);
                firstConnectionResult = result;

                loading.hide();

                page({
                    click: false,
                    hashbang: true,
                    enableHistory: enableHistory()
                });
            });
        });
    }

    function enableHistory() {
        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('xbox') != -1) {
            return false;
        }

        return true;
    }

    var localApiClient;

    function bindConnectionManagerEvents(connectionManager) {

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

        Events.on(connectionManager, 'apiclientcreated', function (e, newApiClient) {

            //$(newApiClient).on("websocketmessage", Dashboard.onWebSocketMessageReceived).on('requestfail', Dashboard.onRequestFail);
        });

        Events.on(connectionManager, 'localusersignedin', function (e, user) {

            localApiClient = connectionManager.getApiClient(user.ServerId);

            document.dispatchEvent(new CustomEvent("usersignedin", {
                detail: {
                    user: user,
                    apiClient: localApiClient
                }
            }));
        });

        Events.on(connectionManager, 'localusersignedout', function (e) {

            document.dispatchEvent(new CustomEvent("usersignedout", {}));
        });

    }

    function authenticate(ctx, route, callback) {

        var firstResult = firstConnectionResult;
        if (firstResult) {

            firstConnectionResult = null;

            if (firstResult.State != MediaBrowser.ConnectionState.SignedIn) {

                handleConnectionResult(firstResult, loading);
                return;
            }
        }

        var server = connectionManager.currentLoggedInServer();
        var pathname = ctx.pathname.toLowerCase();

        console.log('Emby.Page - processing path request ' + pathname);

        if (server) {

            console.log('Emby.Page - user is authenticated');

            if (ctx.isBack && (route.isDefaultRoute /*|| isStartup(ctx)*/)) {
                handleBackToDefault();
            }
            else if (route.isDefaultRoute) {
                console.log('Emby.Page - loading theme home page');
                Emby.ThemeManager.loadUserTheme();
            } else {
                console.log('Emby.Page - next()');
                callback();
            }
            return;
        }

        console.log('Emby.Page - user is not authenticated');

        if (!allowAnonymous(ctx)) {

            console.log('Emby.Page - route does not allow anonymous access, redirecting to login');
            redirectToLogin();
        }
        else {

            console.log('Emby.Page - proceeding to ' + pathname);
            callback();
        }
    }

    var isHandlingBackToDefault;
    function handleBackToDefault() {

        Emby.ThemeManager.loadUserTheme();

        if (isHandlingBackToDefault) {
            return;
        }

        isHandlingBackToDefault = true;

        // This must result in a call to either 
        // Emby.ThemeManager.loadUserTheme();
        // Logout
        // Or exit app

        Emby.ThemeManager.getCurrentTheme().showBackMenu(function (wasCancelled) {

            isHandlingBackToDefault = false;

            if (wasCancelled) {
                //Emby.ThemeManager.loadUserTheme();
            }
        });
    }

    function loadContent(ctx, route, html, request) {

        // TODO: replace with route package name
        html = Globalize.translateHtml(html, route.packageName);
        request.view = html;

        viewManager.loadView(request);

        currentRouteInfo = {
            route: route,
            path: ctx.path
        };
        //next();

        ctx.handled = true;
    }

    var baseRoute = window.location.href.split('?')[0].replace('/index.html', '');
    // support hashbang
    baseRoute = baseRoute.split('#')[0];
    if (baseRoute.lastIndexOf('/') == baseRoute.length - 1) {
        baseRoute = baseRoute.substring(0, baseRoute.length - 1);
    }
    function baseUrl() {
        return baseRoute;
    }

    function getHandler(route) {
        return function (ctx, next) {
            handleRoute(ctx, next, route);
        };
    }

    function getWindowLocationSearch(win) {

        var currentPath = currentRouteInfo ? (currentRouteInfo.path || '') : '';

        var index = currentPath.indexOf('?');
        var search = '';

        if (index != -1) {
            search = currentPath.substring(index);
        }

        return search || '';
    }

    function param(name, url) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS, "i");

        var results = regex.exec(url || getWindowLocationSearch());
        if (results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function back() {

        page.back();
    }
    function canGoBack() {

        var curr = current();

        if (!curr) {
            return false;
        }

        if (curr.type == 'home') {
            return false;
        }
        return page.canGoBack();
    }
    function show(path, options) {

        return new Promise(function (resolve, reject) {

            var baseRoute = baseUrl();
            path = path.replace(baseRoute, '');

            if (currentRouteInfo && currentRouteInfo.path == path) {

                // can't use this with home right now due to the back menu
                if (currentRouteInfo.route.type != 'home') {
                    resolve();
                    return;
                }
            }

            page.show(path, options);
            setTimeout(resolve, 500);
        });
    }

    var currentRouteInfo;
    function current() {
        return currentRouteInfo ? currentRouteInfo.route : null;
    }

    function goHome() {

        show(Emby.ThemeManager.getCurrentTheme().getHomeRoute());
    }

    function showItem(item) {

        if (typeof (item) === 'string') {
            Emby.Models.item(item).then(showItem);

        } else {
            Emby.ThemeManager.getCurrentTheme().showItem(item);
        }
    }

    function setTitle(title) {
        Emby.ThemeManager.getCurrentTheme().setTitle(title);
    }

    function gotoSettings() {
        show('/settings/settings.html');
    }

    function selectServer() {
        show('/startup/selectserver.html');
    }

    function showVideoOsd() {
        return show(Emby.ThemeManager.getCurrentTheme().getVideoOsdRoute());
    }

    var allRoutes = [];

    function addRoute(path, newRoute) {

        page(path, getHandler(newRoute));
        allRoutes.push(newRoute);
    }

    function getRoutes() {
        return allRoutes;
    }

    function setTransparency(level) {

        if (level == Emby.TransparencyLevel.Full) {
            Emby.Backdrop.clear(true);
            document.documentElement.classList.add('transparentDocument');
        }
        else if (level == Emby.TransparencyLevel.Backdrop) {
            Emby.Backdrop.externalBackdrop(true);
            document.documentElement.classList.add('transparentDocument');
        } else {
            Emby.Backdrop.externalBackdrop(false);
            document.documentElement.classList.remove('transparentDocument');
        }
    }

    function pushState(state, title, url) {

        state.navigate = false;

        page.pushState(state, title, url);
    }

    return {
        addRoute: addRoute,
        param: param,
        back: back,
        show: show,
        start: start,
        baseUrl: baseUrl,
        canGoBack: canGoBack,
        current: current,
        redirectToLogin: redirectToLogin,
        goHome: goHome,
        gotoSettings: gotoSettings,
        showItem: showItem,
        setTitle: setTitle,
        selectServer: selectServer,
        showVideoOsd: showVideoOsd,
        setTransparency: setTransparency,
        getRoutes: getRoutes,

        pushState: pushState,

        TransparencyLevel: {
            None: 0,
            Backdrop: 1,
            Full: 2
        }
    };

});
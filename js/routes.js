(function (globalScope) {

    var viewManager;
    require(['viewManager'], function (viewManagerInstance) {
        viewManager = viewManagerInstance;
    });

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

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            connectionManager.connect().done(function (result) {
                handleConnectionResult(result, loading);
            });
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
                    result.ApiClient.getPublicUsers().done(function (users) {

                        if (users.length) {
                            Emby.Page.show('/startup/login.html?serverid=' + result.Servers[0].Id);
                        } else {
                            Emby.Page.show('/startup/manuallogin.html?serverid=' + result.Servers[0].Id);
                        }
                    });
                }
                break;
            case MediaBrowser.ConnectionState.ServerSelection:
                {
                    Emby.Page.show('/startup/selectserver.html');
                }
                break;
            case MediaBrowser.ConnectionState.ConnectSignIn:
                {
                    Emby.Page.show('/startup/welcome.html');
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

        fetch(url, { mode: 'no-cors' }).then(function (response) {
            return response.text();
        }).then(function (body) {
            loadContent(ctx, route, body, request);
        }).catch(next);
    }

    function handleRoute(ctx, next, route) {

        authenticate(ctx, route, function () {

            require(route.dependencies || [], function () {
                sendRouteToViewManager(ctx, next, route);
            });
        });
    }

    function cancelCurrentLoadRequest() {
        var currentRequest = currentViewLoadRequest;
        if (currentRequest) {
            currentRequest.cancel = true;
        }
    }

    var currentViewLoadRequest;
    function sendRouteToViewManager(ctx, next, route) {

        cancelCurrentLoadRequest();

        var url = window.location.href;
        var isBackNav = ctx.isBack;

        var currentRequest = {
            id: route.id,
            url: url,
            transition: route.transition,
            isBack: isBackNav,
            state: ctx.state
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
            onNewViewNeeded();
            return;
        }

        viewManager.tryRestoreView(currentRequest).then(function () {

            // done
            currentRoute = route;

        }, onNewViewNeeded);
    }

    var firstConnectionResult;
    function start() {

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            connectionManager.connect().done(function (result) {

                bindConnectionManagerEvents(connectionManager);
                firstConnectionResult = result;

                loading.hide();

                page({
                    click: false
                });
            });
        });
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

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

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

            Logger.log('Emby.Page - processing path request ' + pathname);

            if (server) {

                Logger.log('Emby.Page - user is authenticated');

                if (ctx.isBack && (route.isDefaultRoute /*|| isStartup(ctx)*/)) {
                    handleBackToDefault();
                }
                else if (route.isDefaultRoute) {
                    Logger.log('Emby.Page - loading theme home page');

                    Emby.ThemeManager.loadUserTheme();
                } else {
                    Logger.log('Emby.Page - next()');
                    callback();
                }
                return;
            }

            Logger.log('Emby.Page - user is not authenticated');

            if (!allowAnonymous(ctx)) {

                Logger.log('Emby.Page - route does not allow anonymous access, redirecting to login');
                redirectToLogin();
            }
            else {

                Logger.log('Emby.Page - proceeding to ' + pathname);
                callback();
            }
        });
    }

    var isHandlingBackToDefault;
    function handleBackToDefault() {

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
                Emby.ThemeManager.loadUserTheme();
            }
        });
    }

    function loadContent(ctx, route, html, request) {

        html = Globalize.translateHtml(html);
        request.view = html;

        viewManager.loadView(request);
        currentRoute = route;
        //next();

        ctx.handled = true;
    }

    var baseRoute = window.location.href.split('?')[0].replace('/index.html', '');
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

    function getWindowUrl(win) {
        return (win || window).location.href;
    }

    function getWindowLocationSearch(win) {

        var search = (win || window).location.search;

        if (!search) {

            var index = window.location.href.indexOf('?');
            if (index != -1) {
                search = window.location.href.substring(index);
            }
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

        if (canGoBack()) {
            history.back();

        } else {

            require(['apphost'], function (apphost) {

                if (apphost.supports('Exit')) {
                    apphost.exit();
                } else {

                    // Sign out since that's the closest thing we can do to closing the app
                    Emby.App.logout();
                }
            });
        }
    }
    function canGoBack() {

        var curr = current();

        if (!curr) {
            return false;
        }

        if (curr.type == 'home') {
            return false;
        }
        return history.length > 1;
    }
    function show(path, options) {

        var baseRoute = Emby.Page.baseUrl();
        path = path.replace(baseRoute, '');

        page.show(path, options);
    }

    var currentRoute;
    function current() {
        return currentRoute;
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    function goHome() {
        Emby.ThemeManager.getCurrentTheme().goHome();
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
        Emby.Page.show('/settings/settings.html');
    }

    function selectServer() {
        Emby.Page.show('/startup/selectserver.html');
    }

    globalScope.Emby.Page = {
        getHandler: getHandler,
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
        selectServer: selectServer
    };

})(this);

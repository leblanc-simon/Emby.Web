define([], function () {

    function getMinIdleTime() {
        // Returns the minimum amount of idle time required before the screen saver can be displayed
        //return 3000;
        return 180000;
    }

    function ScreenSaverManager() {

        var self = this;
        var activeScreenSaver;

        function showScreenSaver(screensaver) {

            Logger.log('Showing screensaver ' + screensaver.name);

            screensaver.show();
            activeScreenSaver = screensaver;

            if (screensaver.hideOnClick !== false) {
                window.addEventListener('click', hide, true);
            }
            if (screensaver.hideOnMouse !== false) {
                window.addEventListener('mousemove', hide, true);
            }
            if (screensaver.hideOnKey !== false) {
                window.addEventListener('keydown', hide, true);
            }
        }

        function hide() {
            if (activeScreenSaver) {
                Logger.log('Hiding screensaver');
                activeScreenSaver.hide();
                activeScreenSaver = null;
            }

            window.removeEventListener('click', hide);
            window.removeEventListener('mousemove', hide);
            window.removeEventListener('keydown', hide);
        }

        self.isShowing = function () {
            return activeScreenSaver != null;
        };

        self.show = function () {
            var screensavers = Emby.PluginManager.ofType('screensaver');

            require(['connectionManager'], function (connectionManager) {

                var server = connectionManager.currentLoggedInServer();

                show(screensavers, server);
            });
        };

        function show(screensavers, currentServer) {

            if (currentServer) {

                var loggedInScreenSavers = screensavers.filter(function (screensaver) {
                    return !screensaver.supportsAnonymous;
                });

                if (loggedInScreenSavers.length) {
                    screensavers = loggedInScreenSavers;
                }

            } else {

                screensavers = screensavers.filter(function (screensaver) {
                    return screensaver.supportsAnonymous;
                });
            }

            // Perform some other filter here to get the configured screensaver

            var current = screensavers.length ? screensavers[0] : null;
            if (current) {
                showScreenSaver(current);
            }
        }

        self.hide = function () {
            hide();
        };

        function onInterval() {
            
            if (self.isShowing()) {
                return;
            }

            require(['inputmanager'], function (inputmanager) {

                var minIdleTime = getMinIdleTime();

                if (minIdleTime > inputmanager.idleTime()) {
                    return;
                }

                if (Emby.PlaybackManager.isPlayingVideo()) {
                    return;
                }

                self.show();
            });
        }

        setInterval(onInterval, 10000);
    }

    return new ScreenSaverManager();
});
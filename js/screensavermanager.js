define([], function () {

    function getMinIdleTime() {
        // Returns the minimum amount of idle time required before the screen saver can be displayed
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
                document.addEventListener('click', hide);
            }
            if (screensaver.hideOnMouse !== false) {
                document.addEventListener('mousemove', hide);
            }
            if (screensaver.hideOnKey !== false) {
                document.addEventListener('keydown', hide);
            }
        }

        function hide() {
            if (activeScreenSaver) {
                Logger.log('Hiding screensaver');
                activeScreenSaver.hide();
                activeScreenSaver = null;
            }

            document.removeEventListener('click', hide);
            document.removeEventListener('mousemove', hide);
            document.removeEventListener('keydown', hide);
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

            require(['inputreceiver'], function (inputreceiver) {

                var minIdleTime = getMinIdleTime();

                if (minIdleTime > inputreceiver.idleTime()) {
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
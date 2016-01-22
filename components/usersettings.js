define(['appsettings', 'connectionManagerResolver', 'events', 'browser'], function (appsettings, connectionManagerResolver, events, browser) {

    function getUserId() {

        var connectionManager = connectionManagerResolver();

        if (connectionManager.currentApiClient) {
            return connectionManager.currentApiClient().getCurrentUserId();
        }

        return null;
    }

    var obj = function () {

        var self = this;

        self.set = function (name, value) {

            var userId = getUserId();
            if (!userId) {
                throw new Error('userId cannot be null');
            }
            appsettings.set(name, value, userId);
            events.trigger(self, 'change', [name]);
        };

        self.get = function (name) {
            var userId = getUserId();
            if (!userId) {
                throw new Error('userId cannot be null');
            }
            return appsettings.get(name, userId);
        };

        self.enableCinemaMode = function (val) {

            if (val != null) {
                self.set('enableCinemaMode', val.toString());
            }

            val = self.get('enableCinemaMode');

            if (val) {
                return val != 'false';
            }

            if (browser.mobile) {
                return false;
            }

            return true;
        };

    };

    return new obj();
});
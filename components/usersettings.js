define(['appsettings', 'connectionManager', 'events'], function (appsettings, connectionManager, events) {

    function getUserId() {

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
    };

    return new obj();
});
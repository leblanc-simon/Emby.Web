define(['appsettings', 'connectionManager'], function (appsettings, connectionManager) {

    function getUserId() {
        return connectionManager.currentApiClient().getCurrentUserId();
    }

    return {
        set: function (name, value) {
            appsettings.set(name, value, getUserId());
        },
        get: function (name) {
            return appsettings.get(name, getUserId());
        }
    };
});
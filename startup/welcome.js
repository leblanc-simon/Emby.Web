define(['loading', 'connectionManager', 'startup/startuphelper'], function (loading, connectionManager, startupHelper) {

    return function (view, params) {

        var self = this;

        view.addEventListener("viewshow", function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(null);
            Emby.Backdrop.clear();

            loading.hide();

            if (!isRestored) {
                view.querySelector('.btnWelcomeNext').addEventListener('click', function () {

                    connectionManager.connect().then(function (result) {

                        loading.hide();

                        startupHelper.handleConnectionResult(result, view);
                    });
                });
            }
        });
    }

});
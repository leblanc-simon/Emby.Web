define(['loading', 'connectionManager', 'startup/startuphelper'], function (loading, connectionManager, startupHelper) {

    return function (view, params) {

        var self = this;

        view.addEventListener("viewshow", function (e) {

            var isRestored = e.detail.isRestored;

            var serverId = params.serverid;

            Emby.Page.setTitle(null);
            Emby.Backdrop.clear();

            require(['connectionManager', 'loading'], function (connectionManager, loading) {

                loading.show();

                var apiClient = connectionManager.getApiClient(serverId);
                apiClient.getPublicUsers().then(function (result) {

                    startupHelper.renderLoginUsers(view, apiClient, result, serverId, !isRestored);
                    view.querySelector('.pageHeader').classList.remove('hide');

                }, function (result) {

                    startupHelper.renderLoginUsers(view, apiClient, [], serverId, !isRestored);
                });
            });

            if (!isRestored) {
                view.querySelector('.scrollSlider').addEventListener('click', function (e) {

                    startupHelper.onScrollSliderClick(e, function (card) {

                        var url = card.getAttribute('data-url');

                        if (url) {
                            Emby.Page.show(url);
                        } else {
                            startupHelper.authenticateUser(view, card.getAttribute('data-serverid'), card.getAttribute('data-name'));
                        }
                    });
                });
            }
        });
    }

});
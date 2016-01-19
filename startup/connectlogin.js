define(['loading', 'connectionManager', 'startup/startuphelper'], function (loading, connectionManager, startupHelper) {

    return function (view, params) {

        var self = this;

        view.addEventListener("viewshow", function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(null);
            Emby.Backdrop.clear();

            if (!isRestored) {
                view.querySelector('form').addEventListener('submit', function (e) {

                    startupHelper.signIntoConnect(view);
                    e.preventDefault();
                    return false;
                });

                view.querySelector('.btnSkipConnect').addEventListener('click', function (e) {

                    loading.show();

                    connectionManager.connect().then(function (result) {

                        loading.hide();

                        if (result.State == MediaBrowser.ConnectionState.ConnectSignIn) {
                            Emby.Page.show('/startup/manualserver.html');
                        } else {
                            startupHelper.handleConnectionResult(result, view);
                        }
                    });
                });

                var paperSubmit = view.querySelector('.paperSubmit');
                if (paperSubmit) {
                    // This element won't be here in the lite version
                    paperSubmit.addEventListener('click', function (e) {

                        // Do a fake form submit this the button isn't a real submit button
                        var fakeSubmit = document.createElement('input');
                        fakeSubmit.setAttribute('type', 'submit');
                        fakeSubmit.style.display = 'none';
                        var form = view.querySelector('form');
                        form.appendChild(fakeSubmit);
                        fakeSubmit.click();
                        form.removeChild(fakeSubmit);
                    });
                }
            }
        });
    }

});
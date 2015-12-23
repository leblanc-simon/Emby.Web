(function (document) {

    document.addEventListener("viewinit-settings", function (e) {

        new settingsPage(e.target);
    });

    function settingsPage(view) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var element = e.detail.element;
            var params = e.detail.params;
            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('Settings'));

            require(['loading'], function (loading) {
                loading.hide();
            });

            if (!isRestored) {
                renderSettings();
            }
        });

        function renderSettings() {

            var routes = Emby.Page.getRoutes().filter(function (r) {
                return r.type == 'settings';
            });

            routes = routes.sort(function (a, b) {

                var aName = Globalize.translate('core#' + a.category || 'General');
                var bName = Globalize.translate('core#' + b.category || 'General');

                if (aName > bName) {
                    return 1;
                }
                if (bName > aName) {
                    return -1;
                }

                aName = (a.title);
                bName = (b.title);

                if (aName > bName) {
                    return 1;
                }
                if (bName > aName) {
                    return -1;
                }

                return 0;
            });
        }

        view.addEventListener('viewdestroy', function () {
        });
    }

})(document);
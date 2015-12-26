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

            renderRoutes(routes);
        }

        function renderRoutes(routes) {

            var html = '';
            var currentCategory = '';

            for (var i = 0, length = routes.length; i < length; i++) {

                var route = routes[i];
                var category = getCategoryTitle(route);

                if (category != currentCategory) {
                    if (currentCategory) {

                        // close the items container
                        html += '</div>';

                        // close the section
                        html += '</div>';
                    }

                    html += '<div>';
                    html += '<h1>';
                    html += category;
                    html += '</h1>';
                    html += '<div>';
                }

                currentCategory = category;

                html += getRouteHtml(route);
            }

            if (html) {
                // close the items container
                html += '</div>';

                // close the section
                html += '</div>';
            }

            view.querySelector('.dynamicRoutes').innerHTML = html;
            Emby.ImageLoader.lazyChildren(view);
        }

        function getRouteHtml(route) {
            
            var html = '';
            return html;
        }

        function getCategoryTitle(route) {

            switch (route.category) {

                case 'General':
                    return Globalize.translate('core#General');
                case 'Playback':
                    return Globalize.translate('core#Playback');
                case 'Theme':
                    return Globalize.translate('core#Theme');
                default:
                    return Globalize.translate('core#Other');
            }

        }

        view.addEventListener('viewdestroy', function () {
        });
    }

})(document);
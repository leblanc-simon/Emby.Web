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

        view.addEventListener('click', function (e) {

            var card = Emby.Dom.parentWithClass(e.target, 'card');

            if (card) {
                var path = card.getAttribute('data-path');

                Emby.Page.show(path);
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

            setTimeout(function() {
                Emby.FocusManager.autoFocus(view, true);
            }, 300);
        }

        function getRouteHtml(route) {

            var cardImageContainer;

            if (route.thumbImage) {
                cardImageContainer = '<div class="cardImage" style="background-image:url(\'' + route.thumbImage + '\');"></div>';
            }
            else {
                cardImageContainer = '<iron-icon class="cardImageIcon" icon="settings"></iron-icon>';
            }

            var tagName = 'paper-button';
            var innerOpening = '<div class="cardBox">';
            var innerClosing = '</div>';

            return '\
<' + tagName + ' raised class="card backdropCard scalableCard" data-path="' + route.path + '">\
'+ innerOpening + '<div class="cardScalable">\
<div class="cardPadder"></div>\
<div class="cardContent">\
<div class="cardImageContainer coveredImage defaultCardColor'+ getRandomInt(1, 5) + '">\
'+ cardImageContainer + '</div>\
</div>\
</div>\
<div class="cardFooter">\
<div class="cardText">' + route.title + '</div>\
</div>'+ innerClosing + '\
</'+ tagName + '>';
        }

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        function getCategoryTitle(route) {

            switch (route.category) {

                case 'General':
                    return Globalize.translate('core#General');
                case 'Playback':
                    return Globalize.translate('core#Playback');
                case 'Theme':
                    return Globalize.translate('core#Themes');
                default:
                    return Globalize.translate('core#Other');
            }

        }

        view.addEventListener('viewdestroy', function () {
        });
    }

})(document);
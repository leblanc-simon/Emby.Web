(function () {

    document.addEventListener("viewinit-defaulttheme-home", function (e) {

        new homePage(e.detail.element, e.detail.params);
    });

    function homePage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(null);

            if (!isRestored) {
                Emby.Backdrop.clear();

                require(['loading'], function (loading) {

                    loading.show();

                    renderTabs(view, self);
                });
            }
        });
        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
        });


        function renderTabs(view, pageInstance) {

            Emby.Models.userViews().then(function (result) {

                var tabbedPage = new DefaultTheme.TabbedPage(view, {
                    animateFocus: true,
                    handleFocus: true
                });
                tabbedPage.loadViewContent = loadViewContent;
                tabbedPage.renderTabs(result.Items);
                pageInstance.tabbedPage = tabbedPage;
            });
        }

        var isFirstLoad = true;

        function loadViewContent(page, id, type) {

            type = (type || '').toLowerCase();

            var viewName = '';

            switch (type) {
                case 'tvshows':
                    viewName = 'tv';
                    break;
                case 'movies':
                    viewName = 'movies';
                    break;
                case 'channels':
                    viewName = 'channels';
                    break;
                case 'music':
                    viewName = 'music';
                    break;
                case 'playlists':
                    viewName = 'playlists';
                    break;
                case 'boxsets':
                    viewName = 'collections';
                    break;
                case 'livetv':
                    viewName = 'livetv';
                    break;
                default:
                    viewName = 'generic';
                    break;
            }

            require(['httpclient'], function (httpclient) {
                httpclient.request({

                    url: Emby.PluginManager.mapResource('defaulttheme', 'home/views.' + viewName + '.html'),
                    type: 'GET',
                    dataType: 'html'

                }).then(function (html) {

                    loadViewHtml(page, id, html, viewName, isFirstLoad);
                    isFirstLoad = false;
                });
            });
        }
    }

    function loadViewHtml(page, parentId, html, viewName, autoFocus) {

        var homeScrollContent = page.querySelector('.scrollContent');

        html = '<div class="homePanel">' + html + '</div>';
        homeScrollContent.innerHTML = Globalize.translateHtml(html);

        if (homeScrollContent.animate) {
            fadeIn(homeScrollContent, 1);
        }

        require([Emby.PluginManager.mapRequire('defaulttheme', 'home/views.' + viewName + '.js')], function () {

            var homePanel = homeScrollContent.querySelector('.homePanel');
            new DefaultTheme[viewName + 'View'](homePanel, parentId, autoFocus);
        });
    }

    function fadeInRight(elem, iterations) {
        var keyframes = [
          { opacity: '0', transform: 'translate3d(1%, 0, 0)', offset: 0 },
          { opacity: '1', transform: 'none', offset: 1 }];
        var timing = { duration: 200, iterations: iterations };
        elem.animate(keyframes, timing).onfinish = function () {
            //document.dispatchEvent(new CustomEvent("scroll", {}));
        };
    }

    function fadeIn(elem, iterations) {
        var keyframes = [
          { opacity: '0', offset: 0 },
          { opacity: '1', offset: 1 }];
        var timing = { duration: 300, iterations: iterations };
        return elem.animate(keyframes, timing);
    }

})();
(function () {

    document.addEventListener("viewinit-defaulttheme-home", function (e) {

        new homePage(e.target, e.detail.params);
    });

    function homePage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(null);

            DefaultTheme.Backdrop.setStaticBackdrop();

            if (!isRestored) {

                require(['loading'], function (loading) {

                    loading.show();

                    renderTabs(view, self);
                });
                //require(['actionsheet'], function (actionsheet) {

                //    actionsheet.show({
                //        title: 'Confirm Button Select',
                //        items: [
                //        {
                //            name: Globalize.translate('ButtonInstantMix'),
                //            id: 'instantmix',
                //            ironIcon: 'shuffle'
                //        },
                //        {
                //            name: Globalize.translate('ButtonInstantMix'),
                //            id: 'instantmix',
                //            ironIcon: 'shuffle'
                //        }],
                //        callback: function (id) {

                //        }
                //    });

                //});
                //setTimeout(function() {

                //    require(['alert'], function (alert) {
                //        alert({
                //            title: 'Confirm Button Select',
                //            text: 'This is some text to confirm blah blah blah. This is some text to confirm blah blah blah. This is some text to confirm blah blah blah. This is some text to confirm blah blah blah. This is some text to confirm blah blah blah. Are you sure you wish to continue?'
                //        });
                //    });
                //}, 2000);
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
                    handleFocus: true,
                    immediateSpeed: 100,
                });
                tabbedPage.loadViewContent = loadViewContent;
                tabbedPage.renderTabs(result.Items);
                pageInstance.tabbedPage = tabbedPage;
            });
        }

        var isFirstLoad = true;

        function loadViewContent(page, id, type) {

            return new Promise(function (resolve, reject) {

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

                var xhr = new XMLHttpRequest();
                xhr.open('GET', Emby.PluginManager.mapPath('defaulttheme', 'home/views.' + viewName + '.html'), true);

                xhr.onload = function (e) {

                    var html = this.response;
                    loadViewHtml(page, id, html, viewName, isFirstLoad);
                    isFirstLoad = false;
                    resolve();
                }

                xhr.send();
            });
        }
    }

    function loadViewHtml(page, parentId, html, viewName, autoFocus) {

        var homeScrollContent = page.querySelector('.contentScrollSlider');

        html = html;
        homeScrollContent.innerHTML = Globalize.translateHtml(html);

        require([Emby.PluginManager.mapPath('defaulttheme', 'home/views.' + viewName + '.js')], function () {

            var homePanel = homeScrollContent;
            new DefaultTheme[viewName + 'View'](homePanel, parentId, autoFocus);
        });
    }

})();
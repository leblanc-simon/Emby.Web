(function () {

    document.addEventListener("viewinit-defaulttheme-music", function (e) {

        new musicPage(e.detail.element, e.detail.params);
    });

    function musicPage(view, params) {

        var self = this;
        var itemPromise;

        view.addEventListener('viewshow', function (e) {

            require(['loading'], function (loading) {

                if (!self.tabbedPage) {
                    loading.show();
                    renderTabs(view, params.tab, self, params);
                }

                itemPromise = itemPromise || Emby.Models.item(params.parentid);

                itemPromise.then(function (item) {

                    Emby.Page.setTitle(item.Name);
                });
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
        });

        function renderTabs(view, initialTabId, pageInstance, params) {

            var tabs = [
            {
                Name: Globalize.translate('Albums'),
                Id: "albums"
            },
            {
                Name: Globalize.translate('AlbumArtists'),
                Id: "albumartists"
            },
            {
                Name: Globalize.translate('Artists'),
                Id: "artists"
            },
            {
                Name: Globalize.translate('Genres'),
                Id: "genres"
            },
            {
                Name: Globalize.translate('Playlists'),
                Id: "playlists"
            }];

            //tabs.push({
            //    Name: Globalize.translate('Songs'),
            //    Id: "songs"
            //});

            var tabbedPage = new DefaultTheme.TabbedPage(view);
            tabbedPage.loadViewContent = loadViewContent;
            tabbedPage.params = params;
            tabbedPage.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPage;
        }

        function loadViewContent(page, id) {

            if (self.listController) {
                self.listController.destroy();
            }

            var pageParams = this.params;

            var autoFocus = false;

            if (!this.hasLoaded) {
                autoFocus = true;
                this.hasLoaded = true;
            }

            switch (id) {

                case 'albumartists':
                    renderAlbumArtists(page, pageParams, autoFocus, this.bodySlyFrame);
                    break;
                case 'artists':
                    renderArtists(page, pageParams, autoFocus, this.bodySlyFrame);
                    break;
                case 'albums':
                    renderAlbums(page, pageParams, autoFocus, this.bodySlyFrame);
                    break;
                case 'playlists':
                    renderPlaylists(page, pageParams, autoFocus, this.bodySlyFrame);
                    break;
                case 'songs':
                    renderSongs(page, pageParams, autoFocus, this.bodySlyFrame);
                    break;
                case 'genres':
                    renderGenres(page, pageParams, autoFocus, this.bodySlyFrame);
                    break;
                default:
                    break;
            }
        }

        function renderGenres(page, pageParams, autoFocus, slyFrame) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.genres({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks"
                    });
                },
                cardOptions: {
                    shape: 'backdropCard',
                    rows: 3,
                    preferThumb: true,
                    width: DefaultTheme.CardBuilder.homeThumbWidth
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                slyFrame: slyFrame
            });

            self.listController.render();
        }

        function renderPlaylists(page, pageParams, autoFocus, slyFrame) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.playlists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                slyFrame: slyFrame
            });

            self.listController.render();
        }

        function renderAlbums(page, pageParams, autoFocus, slyFrame) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "MusicAlbum",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true
                },
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                slyFrame: slyFrame
            });

            self.listController.render();
        }

        function renderSongs(page, pageParams, autoFocus, slyFrame) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Audio",
                        Recursive: true,
                        SortBy: "SortName"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true
                },
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                slyFrame: slyFrame
            });

            self.listController.render();
        }

        function renderArtists(page, pageParams, autoFocus, slyFrame) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.artists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true
                },
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                slyFrame: slyFrame
            });

            self.listController.render();
        }

        function renderAlbumArtists(page, pageParams, autoFocus, slyFrame) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.albumArtists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks"
                    });
                },
                listCountElement: page.querySelector('.listCount'),
                listNumbersElement: page.querySelector('.listNumbers'),
                autoFocus: autoFocus,
                cardOptions: {
                    coverImage: true
                },
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                selectedIndexElement: page.querySelector('.selectedIndex'),
                slyFrame: slyFrame
            });

            self.listController.render();
        }
    }

})();
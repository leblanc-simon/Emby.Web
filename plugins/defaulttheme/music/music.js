define(['loading', 'alphapicker'], function (loading, alphaPicker) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            DefaultTheme.Backdrop.setStaticBackdrop();

            if (!self.tabbedPage) {
                loading.show();
                renderTabs(view, params.tab, self, params);
            }

            Emby.Page.setTitle('');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.focusHandler) {
                self.focusHandler.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
        });

        function renderTabs(view, initialTabId, pageInstance, params) {

            self.alphaPicker = new alphaPicker({
                element: view.querySelector('.alphaPicker'),
                itemsContainer: view.querySelector('.contentScrollSlider'),
                itemClass: 'card'
            });

            self.alphaPicker.visible(false);

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
                },
                {
                    Name: Globalize.translate('Favorites'),
                    Id: "favorites"
                }
            ];

            //tabs.push({
            //    Name: Globalize.translate('Songs'),
            //    Id: "songs"
            //});

            var tabbedPage = new DefaultTheme.TabbedPage(view, {
                alphaPicker: self.alphaPicker
            });
            tabbedPage.loadViewContent = loadViewContent;
            tabbedPage.params = params;
            tabbedPage.renderTabs(tabs, initialTabId);
            pageInstance.tabbedPage = tabbedPage;
        }

        function loadViewContent(page, id) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }
                if (self.focusHandler) {
                    self.focusHandler.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                var showAlphaPicker = false;

                var contentScrollSlider = page.querySelector('.contentScrollSlider');
                contentScrollSlider.removeEventListener('click', onMusicGenresContainerClick);

                switch (id) {

                    case 'albumartists':
                        showAlphaPicker = true;
                        renderAlbumArtists(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'artists':
                        showAlphaPicker = true;
                        renderArtists(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'albums':
                        showAlphaPicker = true;
                        renderAlbums(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'playlists':
                        renderPlaylists(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'songs':
                        renderSongs(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'genres':
                        renderGenres(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        contentScrollSlider.addEventListener('click', onMusicGenresContainerClick);
                        break;
                    case 'favorites':
                        renderFavorites(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    default:
                        break;
                }

                if (self.alphaPicker) {
                    self.alphaPicker.visible(showAlphaPicker);
                    self.alphaPicker.enabled(showAlphaPicker);
                }
            });
        }

        function renderGenres(page, pageParams, autoFocus, slyFrame, resolve) {

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
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function onMusicGenresContainerClick(e) {

            var card = Emby.Dom.parentWithClass(e.target, 'card');

            if (card) {

                var value = card.getAttribute('data-id');
                var parentid = params.parentid;

                e.preventDefault();
                e.stopPropagation();

                Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'list/list.html') + '?parentid=' + parentid + '&genreId=' + value);

                return false;
            }
        }

        function renderPlaylists(page, pageParams, autoFocus, slyFrame, resolve) {

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
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                },
                cardOptions: {
                    showTitle: true
                }
            });

            self.listController.render();
        }

        function renderAlbums(page, pageParams, autoFocus, slyFrame, resolve) {

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
                        Fields: "CumulativeRunTimeTicks,SortName"
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
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderSongs(page, pageParams, autoFocus, slyFrame, resolve) {

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
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderArtists(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.artists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks,SortName"
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
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderAlbumArtists(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.albumArtists({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        SortBy: "SortName",
                        Fields: "CumulativeRunTimeTicks,SortName"
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
                slyFrame: slyFrame,
                onRender: function () {
                    if (resolve) {
                        resolve();
                        resolve = null;
                    }
                }
            });

            self.listController.render();
        }

        function renderFavorites(page, pageParams, autoFocus, slyFrame, resolve) {

            fetch(Emby.PluginManager.mapUrl('defaulttheme', 'music/views.favorites.html'), { mode: 'no-cors' }).then(function (response) {
                return response.text();
            }).then(function (html) {

                var parent = page.querySelector('.contentScrollSlider');
                parent.innerHTML = Globalize.translateHtml(html, 'defaulttheme');
                loadFavoriteArtists(parent, pageParams, autoFocus, resolve);
                loadFavoriteAlbums(parent, pageParams);
            });

            require([Emby.PluginManager.mapPath('defaulttheme', 'cards/focushandler.js')], function (focusHandler) {

                self.focusHandler = new focusHandler({
                    parent: page.querySelector('.contentScrollSlider'),
                    slyFrame: slyFrame,
                    selectedItemInfoInner: page.querySelector('.selectedItemInfoInner')
                });
            });
        }

        function loadFavoriteArtists(parent, pageParams, autoFocus, resolve) {

            Emby.Models.artists({
                ParentId: pageParams.parentid,
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.favoriteArtistsSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                DefaultTheme.CardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'auto',
                    rows: 2
                });

                if (autoFocus) {
                    setTimeout(function () {
                        var firstCard = section.querySelector('.card');
                        if (firstCard) {
                            Emby.FocusManager.focus(firstCard);
                        }
                    }, 400);
                }
                resolve();
            });
        }

        function loadFavoriteAlbums(parent, pageParams) {

            Emby.Models.items({
                ParentId: pageParams.parentid,
                IncludeItemTypes: "MusicAlbum",
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.favoriteAlbumsSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                DefaultTheme.CardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'auto',
                    rows: 3
                });
            });
        }
    }

});
(function () {

    document.addEventListener("viewinit-defaulttheme-movies", function (e) {

        new moviesPage(e.target, e.detail.params);
    });

    function moviesPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            DefaultTheme.Backdrop.setStaticBackdrop();

            require(['loading'], function (loading) {

                if (!self.tabbedPage) {
                    loading.show();
                    renderTabs(view, params.tab, self, params);
                }

                Emby.Page.setTitle('');
            });
        });

        view.addEventListener('viewdestroy', function () {

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

            require(['alphapicker'], function (alphaPicker) {

                self.alphaPicker = new alphaPicker({
                    element: view.querySelector('.alphaPicker'),
                    itemsContainer: view.querySelector('.contentScrollSlider'),
                    itemClass: 'card'
                });

                var tabs = [
                {
                    Name: Globalize.translate('Movies'),
                    Id: "movies"
                },
                {
                    Name: Globalize.translate('Unwatched'),
                    Id: "unwatched"
                },
                {
                    Name: Globalize.translate('Collections'),
                    Id: "collections"
                },
                {
                    Name: Globalize.translate('Genres'),
                    Id: "genres"
                },
                {
                    Name: Globalize.translate('Years'),
                    Id: "years"
                },
                {
                    Name: Globalize.translate('TopRated'),
                    Id: "toprated"
                },
                {
                    Name: Globalize.translate('Favorites'),
                    Id: "favorites"
                }];

                var tabbedPage = new DefaultTheme.TabbedPage(view, {
                    alphaPicker: self.alphaPicker
                });

                tabbedPage.loadViewContent = loadViewContent;
                tabbedPage.params = params;
                tabbedPage.renderTabs(tabs, initialTabId);
                pageInstance.tabbedPage = tabbedPage;
            });
        }

        function loadViewContent(page, id, type) {

            var tabbedPage = this;

            return new Promise(function (resolve, reject) {

                if (self.listController) {
                    self.listController.destroy();
                }

                var pageParams = tabbedPage.params;

                var autoFocus = false;

                if (!tabbedPage.hasLoaded) {
                    autoFocus = true;
                    tabbedPage.hasLoaded = true;
                }

                var showAlphaPicker = false;
                var showListNumbers = false;

                switch (id) {

                    case 'movies':
                        showAlphaPicker = true;
                        showListNumbers = true;
                        renderMovies(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'unwatched':
                        showAlphaPicker = true;
                        showListNumbers = true;
                        renderUnwatchedMovies(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'years':
                        renderYears(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'toprated':
                        showListNumbers = true;
                        renderTopRated(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'collections':
                        showListNumbers = true;
                        renderCollections(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'favorites':
                        showListNumbers = true;
                        renderFavorites(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    case 'genres':
                        renderGenres(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
                        break;
                    default:
                        break;
                }

                if (showListNumbers) {
                    page.querySelector('.listNumbers').classList.remove('hide');
                } else {
                    page.querySelector('.listNumbers').classList.add('hide');
                }

                if (self.alphaPicker) {
                    self.alphaPicker.visible(showAlphaPicker);
                    self.alphaPicker.enabled(showAlphaPicker);
                }
            });
        }

        function renderGenres(page, pageParams, autoFocus, slyFrame, resolve) {

            Emby.Models.genres({
                ParentId: pageParams.parentid,
                SortBy: "SortName"

            }).then(function (genresResult) {

                self.listController = new DefaultTheme.HorizontalList({

                    itemsContainer: page.querySelector('.contentScrollSlider'),
                    getItemsMethod: function (startIndex, limit) {
                        return Emby.Models.items({
                            StartIndex: startIndex,
                            Limit: limit,
                            ParentId: pageParams.parentid,
                            IncludeItemTypes: "Movie",
                            Recursive: true,
                            SortBy: "SortName",
                            Fields: "Genres"
                        });
                    },
                    autoFocus: autoFocus,
                    selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
                    slyFrame: slyFrame,
                    onRender: function () {
                        if (resolve) {
                            resolve();
                            resolve = null;
                        }
                    },
                    cardOptions: {
                        indexBy: 'Genres',
                        genres: genresResult.Items,
                        indexLimit: 4,
                        parentId: pageParams.parentid
                    }
                });

                self.listController.render();
            });
        }

        function renderFavorites(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        Filters: "IsFavorite",
                        SortBy: "SortName"
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
                }
            });

            self.listController.render();
        }

        function renderMovies(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName"
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
                }
            });

            self.listController.render();
        }

        function renderUnwatchedMovies(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "SortName",
                        Fields: "SortName",
                        IsPlayed: false
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
                }
            });

            self.listController.render();
        }

        function renderCollections(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.collections({
                        StartIndex: startIndex,
                        Limit: limit,
                        SortBy: "SortName"
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
                }
            });

            self.listController.render();
        }

        function renderYears(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "ProductionYear,SortName",
                        SortOrder: "Descending"
                    });
                },
                cardOptions: {
                    indexBy: 'ProductionYear'
                },
                autoFocus: autoFocus,
                selectedItemInfoElement: page.querySelector('.selectedItemInfoInner'),
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

        function renderTopRated(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Movie",
                        Recursive: true,
                        SortBy: "CommunityRating,SortName",
                        SortOrder: "Descending"
                    });
                },
                cardOptions: {
                    indexBy: 'CommunityRating'
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
    }

})();
(function () {

    document.addEventListener("viewinit-defaulttheme-tv", function (e) {

        new tvPage(e.target, e.detail.params);
    });

    function tvPage(view, params) {

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

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
            if (self.focusHandler) {
                self.focusHandler.destroy();
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
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
                    Name: Globalize.translate('Series'),
                    Id: "series"
                },
                {
                    Name: Globalize.translate('Genres'),
                    Id: "genres"
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
                var showListNumbers = false;

                switch (id) {

                    case 'series':
                        showAlphaPicker = true;
                        showListNumbers = true;
                        renderSeries(page, pageParams, autoFocus, tabbedPage.bodySlyFrame, resolve);
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

        function renderSeries(page, pageParams, autoFocus, slyFrame, resolve) {

            self.listController = new DefaultTheme.HorizontalList({

                itemsContainer: page.querySelector('.contentScrollSlider'),
                getItemsMethod: function (startIndex, limit) {
                    return Emby.Models.items({
                        StartIndex: startIndex,
                        Limit: limit,
                        ParentId: pageParams.parentid,
                        IncludeItemTypes: "Series",
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
                            IncludeItemTypes: "Series",
                            Recursive: true,
                            SortBy: "SortName",
                            Fields: "Genres"
                        });
                    },
                    autoFocus: autoFocus,
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
    }

})();
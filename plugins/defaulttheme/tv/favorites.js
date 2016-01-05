(function () {

    document.addEventListener("viewinit-defaulttheme-tvfavorites", function (e) {

        new page(e.target, e.detail.params);
    });

    function page(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            DefaultTheme.Backdrop.setStaticBackdrop();

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle('');

            if (!isRestored) {
                createVerticalScroller(view, self);

                renderFavorites(view, params, true, self.slyFrame);
            }
        });

        view.addEventListener('viewdestroy', function () {

        });

        function createVerticalScroller(view, pageInstance) {

            require(["slyScroller", 'loading'], function (slyScroller, loading) {

                var scrollFrame = view.querySelector('.scrollFrame');

                var options = {
                    horizontal: 0,
                    itemNav: 0,
                    mouseDragging: 1,
                    touchDragging: 1,
                    slidee: view.querySelector('.scrollSlider'),
                    itemSelector: '.card',
                    smart: true,
                    scrollBy: 200,
                    speed: 270,
                    dragHandle: 1,
                    dynamicHandle: 1,
                    clickBar: 1,
                    scrollWidth: 50000,
                    immediateSpeed: 100
                };

                slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                    pageInstance.slyFrame = slyFrame;
                    slyFrame.init();
                    initFocusHandler(view, slyFrame);
                });
            });
        }

        function initFocusHandler(view, slyFrame) {

            require([Emby.PluginManager.mapPath('defaulttheme', 'cards/focushandler.js')], function (focusHandler) {

                self.focusHandler = new focusHandler({
                    parent: view.querySelector('.scrollSlider'),
                    slyFrame: slyFrame,
                    zoomScale: '1.10',
                    enableBackdrops: true
                });

            });
        }

        function renderFavorites(page, pageParams, autoFocus, slyFrame) {

            var parent = page.querySelector('.scrollSlider');
            loadFavoriteSeries(parent, pageParams, autoFocus);
            loadFavoriteEpisodes(parent, pageParams);
        }

        function loadFavoriteSeries(parent, pageParams, autoFocus) {

            Emby.Models.items({
                ParentId: pageParams.parentid,
                IncludeItemTypes: "Series",
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.seriesSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                DefaultTheme.CardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    scalable: true
                });

                if (autoFocus) {
                    setTimeout(function () {
                        var firstCard = section.querySelector('.card');
                        if (firstCard) {
                            Emby.FocusManager.focus(firstCard);
                        }
                    }, 400);
                }
            });
        }

        function loadFavoriteEpisodes(parent, pageParams) {

            Emby.Models.items({
                ParentId: pageParams.parentid,
                IncludeItemTypes: "Episode",
                Recursive: true,
                Filters: "IsFavorite",
                SortBy: "SortName"

            }).then(function (result) {

                var section = parent.querySelector('.episodesSection');

                if (result.Items.length) {
                    section.classList.remove('hide');
                } else {
                    section.classList.add('hide');
                }

                DefaultTheme.CardBuilder.buildCards(result.Items, {
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'autoVertical',
                    scalable: true,
                    showTitle: true,
                    showParentTitle: true
                });
            });
        }

    }

})();
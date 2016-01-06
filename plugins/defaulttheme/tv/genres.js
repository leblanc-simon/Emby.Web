(function () {

    document.addEventListener("viewinit-defaulttheme-tvgenres", function (e) {

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

                renderItems(view, params, true, self.slyFrame);
            }
        });

        view.addEventListener('viewdestroy', function () {

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null;
            }
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
                    enableBackdrops: true
                });

            });
        }

        function renderItems(page, pageParams, autoFocus, slyFrame) {

            var parent = page.querySelector('.scrollSlider');

            Emby.Models.genres({
                ParentId: pageParams.parentid,
                SortBy: "SortName"

            }).then(function (genresResult) {

                Emby.Models.items({
                    ParentId: pageParams.parentid,
                    IncludeItemTypes: "Series",
                    Recursive: true,
                    SortBy: "SortName",
                    Fields: "Genres"

                }).then(function (result) {

                    buildCards(parent, pageParams.parentid, result.Items, genresResult.Items);

                    if (autoFocus) {
                        setTimeout(function () {
                            var firstCard = parent.querySelector('.card');
                            if (firstCard) {
                                Emby.FocusManager.focus(firstCard);
                            }
                        }, 400);
                    }
                });
            });
        }

        function buildCards(itemsContainer, parentId, items, genres) {

            DefaultTheme.CardBuilder.buildCards(items, {
                indexBy: 'Genres',
                genres: genres,
                indexLimit: 3,
                parentId: parentId,
                itemsContainer: itemsContainer,
                shape: 'autoVertical',
                scalable: true,
                preferThumb: true
            });
        }
    }

})();
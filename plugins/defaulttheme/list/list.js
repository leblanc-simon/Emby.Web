(function () {

    document.addEventListener("viewinit-defaulttheme-list", function (e) {

        new listPage(e.detail.element, e.detail.params);
    });

    function listPage(view, params) {

        var self = this;
        var itemPromise;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            require(['loading'], function (loading) {

                if (!isRestored) {
                    loading.show();
                }

                Emby.Models.item(params.parentid).then(function (item) {

                    Emby.Page.setTitle(item.Name);

                    if (!isRestored) {
                        createHorizontalScroller(self, view, item, loading);
                    }
                });
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.slyFrame) {
                self.slyFrame.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
        });
    }

    function createHorizontalScroller(instance, view, item, loading) {

        require(["slyScroller", 'loading'], function (slyScroller, loading) {

            var horizontalPageContent = view.querySelector('.horizontalPageContent');
            var scrollFrame = horizontalPageContent.querySelector('.scrollFrame');

            scrollFrame.style.display = 'block';

            var options = {
                horizontal: 1,
                itemNav: 0,
                mouseDragging: 1,
                touchDragging: 1,
                slidee: horizontalPageContent.querySelector('.scrollSlider'),
                itemSelector: '.card',
                smart: true,
                releaseSwing: true,
                scrollBar: horizontalPageContent.querySelector('.scrollbar'),
                scrollBy: 200,
                speed: 600,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                slyFrame.init();
                instance.slyFrame = slyFrame;
                loadChildren(instance, view, item, loading);
            });
        });
    }

    function loadChildren(instance, view, item, loading) {

        instance.listController = new DefaultTheme.HorizontalList({

            itemsContainer: view.querySelector('.scrollSlider'),
            getItemsMethod: function (startIndex, limit) {
                return Emby.Models.children(item, {
                    StartIndex: startIndex,
                    Limit: limit
                });
            },
            listCountElement: view.querySelector('.listCount'),
            listNumbersElement: view.querySelector('.listNumbers'),
            selectedItemInfoElement: view.querySelector('.selectedItemInfoInner'),
            selectedIndexElement: view.querySelector('.selectedIndex'),
            slyFrame: instance.slyFrame
        });

        instance.listController.render();
    }

})();
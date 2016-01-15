define(['loading', 'slyScroller'], function (loading, slyScroller) {

    function createHorizontalScroller(instance, view, item, loading) {

        var scrollFrame = view.querySelector('.scrollFrame');

        scrollFrame.style.display = 'block';

        var options = {
            horizontal: 1,
            itemNav: 0,
            mouseDragging: 1,
            touchDragging: 1,
            slidee: view.querySelector('.scrollSlider'),
            itemSelector: '.card',
            smart: true,
            releaseSwing: true,
            scrollBar: view.querySelector('.scrollbar'),
            scrollBy: 200,
            speed: 270,
            elasticBounds: 1,
            dragHandle: 1,
            dynamicHandle: 1,
            clickBar: 1,
            //centerOffset: window.innerWidth * .05,
            scrollWidth: 200000
        };

        slyScroller.create(scrollFrame, options).then(function (slyFrame) {
            slyFrame.init();
            instance.slyFrame = slyFrame;
            loadChildren(instance, view, item, loading);
        });
    }

    function getItems(params, item, startIndex, limit) {

        if (params.type == 'collections') {

            return Emby.Models.collections({
                ParentId: item.Id,
                EnableImageTypes: "Primary,Backdrop,Thumb",
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName'
            });
        }

        if (params.type == 'favoritemovies') {

            return Emby.Models.items({
                ParentId: item.Id,
                EnableImageTypes: "Primary,Backdrop,Thumb",
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName',
                IncludeItemTypes: 'Movie',
                Recursive: true,
                Filters: "IsFavorite"
            });
        }

        if (params.genreId) {

            return Emby.Models.items({
                StartIndex: startIndex,
                Limit: limit,
                SortBy: 'SortName',
                Recursive: true,
                GenreIds: params.genreId,
                ParentId: item.Id,
                IncludeItemTypes: item.CollectionType == 'tvshows' ? 'Series' : (item.CollectionType == 'movies' ? 'Movie' : 'MusicAlbum')
            });

        }
        return Emby.Models.children(item, {
            StartIndex: startIndex,
            Limit: limit
        });
    }

    function loadChildren(instance, view, item, loading) {

        instance.listController = new DefaultTheme.HorizontalList({

            itemsContainer: view.querySelector('.scrollSlider'),
            getItemsMethod: function (startIndex, limit) {

                return getItems(instance.params, item, startIndex, limit);
            },
            listCountElement: view.querySelector('.listCount'),
            listNumbersElement: view.querySelector('.listNumbers'),
            selectedItemInfoElement: view.querySelector('.selectedItemInfoInner'),
            selectedIndexElement: view.querySelector('.selectedIndex'),
            slyFrame: instance.slyFrame,
            cardOptions: {
                coverImage: true
            }
        });

        instance.listController.render();
    }

    return function (view, params) {

        var self = this;
        self.params = params;
        var currentItem;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            if (!isRestored) {
                loading.show();

                view.querySelector('.scrollSlider').addEventListener('click', onItemsContainerClick);
            }

            Emby.Models.item(params.parentid).then(function (item) {

                if (!params.genreId) {
                    setTitle(item);
                }
                currentItem = item;

                if (!isRestored) {
                    createHorizontalScroller(self, view, item, loading);
                }

                if (!params.genreId) {
                    view.querySelector('.listPageButtons').classList.add('hide');
                }
            });

            if (params.genreId) {
                Emby.Models.item(params.genreId).then(function (item) {

                    currentItem = item;
                    Emby.Page.setTitle(item.Name);

                    if (item.Type == 'MusicGenre') {
                        view.querySelector('.listPageButtons').classList.remove('hide');
                    } else {
                        view.querySelector('.listPageButtons').classList.add('hide');
                    }

                    if (Emby.PlaybackManager.canQueue(item)) {
                        view.querySelector('.btnQueue').classList.remove('hide');
                    } else {
                        view.querySelector('.btnQueue').classList.add('hide');
                    }
                });
            }

            if (!isRestored) {
                view.querySelector('.btnPlay').addEventListener('click', play);
                view.querySelector('.btnQueue').addEventListener('click', queue);
                view.querySelector('.btnInstantMix').addEventListener('click', instantMix);
                view.querySelector('.btnShuffle').addEventListener('click', shuffle);
            }

        });

        function setTitle(item) {

            if (params.type == 'collections') {
                Emby.Page.setTitle(Globalize.translate('Collections'));
            } else if (params.type == 'favoritemovies') {
                Emby.Page.setTitle(Globalize.translate('FavoriteMovies'));
            } else {
                Emby.Page.setTitle(item.Name);
            }
        }

        function play() {

            Emby.PlaybackManager.play({
                items: [currentItem]
            });
        }

        function queue() {

            Emby.PlaybackManager.queue({
                items: [currentItem]
            });
        }

        function instantMix() {
            Emby.PlaybackManager.instantMix(currentItem.Id);
        }

        function shuffle() {
            Emby.PlaybackManager.shuffle(currentItem.Id);
        }

        view.addEventListener('viewdestroy', function () {

            if (self.slyFrame) {
                self.slyFrame.destroy();
            }
            if (self.listController) {
                self.listController.destroy();
            }
        });

        function onItemsContainerClick(e) {
            var card = Emby.Dom.parentWithClass(e.target, 'card');

            if (!card) {
                return;
            }

            var type = card.getAttribute('data-type');
            if (type != 'Photo') {
                return;
            }

            var startItemId = card.getAttribute('data-id');
            showSlideshow(startItemId);

            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        function showSlideshow(startItemId) {

            Emby.Models.children(currentItem, {

                MediaTypes: 'Photo',
                Filters: 'IsNotFolder'

            }).then(function (result) {

                var items = result.Items;

                var index = items.map(function (i) {
                    return i.Id;

                }).indexOf(startItemId);

                if (index == -1) {
                    index = 0;
                }

                require(['slideshow'], function (slideshow) {

                    var newSlideShow = new slideshow({
                        showTitle: false,
                        cover: false,
                        items: items,
                        startIndex: index,
                        interval: 5000,
                        interactive: true
                    });

                    newSlideShow.show();
                });

            });
        }
    }

});
(function () {

    document.addEventListener("viewinit-defaulttheme-search", function (e) {

        new searchPage(e.detail.element, e.detail.params);
    });

    function searchPage(view, params) {

        var self = this;

        function onAlphaValueClicked(e) {

            var value = e.detail.value;

            var txtSearch = view.querySelector('.txtSearch');

            if (value == 'backspace') {

                var val = txtSearch.value;
                txtSearch.value = val.length ? val.substring(0, val.length - 1) : '';

            } else {
                txtSearch.value += value;
            }

            if (txtSearch.value) {
                search(txtSearch.value);
            } else {

                var emptyResult = {
                    SearchHints: []
                };
                populateResults(emptyResult, '.peopleResults');
                populateResults(emptyResult, '.movieResults');
                populateResults(emptyResult, '.seriesResults');
                populateResults(emptyResult, '.artistResults');
                populateResults(emptyResult, '.albumResults');
            }
        }

        function search(value) {

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: true,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false,
                IncludeItemTypes: "Movie"

            }, '.movieResults');

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: true,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false,
                IncludeItemTypes: "Series"

            }, '.seriesResults');

            searchType(value, {

                searchTerm: value,
                IncludePeople: true,
                IncludeMedia: false,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false

            }, '.peopleResults', {

                coverImage: true,
                showTitle: true,
                overlayTitle: false
            });

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: false,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: true

            }, '.artistResults', {

                coverImage: true,
                showTitle: true,
                overlayTitle: false
            });

            searchType(value, {

                searchTerm: value,
                IncludePeople: false,
                IncludeMedia: true,
                IncludeGenres: false,
                IncludeStudios: false,
                IncludeArtists: false,
                IncludeItemTypes: "MusicAlbum"

            }, '.albumResults');
        }

        function searchType(value, query, section, cardOptions) {

            query.Limit = 6;

            Emby.Models.search(query).then(function (result) {

                populateResults(result, section, cardOptions);

            });
        }

        function populateResults(result, section, cardOptions) {

            section = view.querySelector(section);

            var items = result.SearchHints;

            if (items.length) {
                section.classList.remove('hide');
            } else {
                section.classList.add('hide');
            }

            cardOptions = cardOptions || {};
            cardOptions.itemsContainer = section.querySelector('.items');
            cardOptions.shape = 'autoVertical';
            cardOptions.scalable = true;

            DefaultTheme.CardBuilder.buildCards(items, cardOptions);
        }

        function initAlphaPicker(view) {

            require(['alphapicker'], function (alphaPicker) {

                var alphaPickerElement = view.querySelector('.alphaPicker');

                self.alphaPicker = new alphaPicker({
                    element: alphaPickerElement,
                    mode: 'keyboard'
                });

                self.alphaPicker.focus();
                alphaPickerElement.addEventListener('alphavalueclicked', onAlphaValueClicked);
            });
        }

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle('');
            document.querySelector('.headerSearchButton').classList.add('hide');

            var isRestored = e.detail.isRestored;

            if (!isRestored) {
                initAlphaPicker(e.detail.element);

                createVerticalScroller(e.detail.element, self);
            }
        });

        view.addEventListener('viewhide', function () {

            document.querySelector('.headerSearchButton').classList.remove('hide');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null
            }
            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
            if (self.verticalSlyFrame) {
                self.verticalSlyFrame.destroy();
            }
        });
    }

    function createVerticalScroller(view, pageInstance) {

        require(["slyScroller", 'loading'], function (slyScroller, loading) {

            var scrollFrame = view.querySelector('.scrollFrameY');

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
                scrollWidth: 10000
            };

            slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                pageInstance.verticalSlyFrame = slyFrame;
                slyFrame.init();
                initFocusHandler(view, slyFrame);
            });
        });
    }

    function initFocusHandler(view, slyFrame) {

        var scrollSlider = view.querySelector('.scrollSlider');

        require([Emby.PluginManager.mapPath('defaulttheme', 'cards/focushandler.js')], function (focusHandler) {

            self.focusHandler = new focusHandler({
                parent: scrollSlider,
                slyFrame: slyFrame
            });

        });
    }

})();
(function (globalScope) {

    function loadResume(element, parentId) {

        var options = {

            Limit: 6,
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.resumable(options).then(function (result) {

            var resumeSection = element.querySelector('.resumeSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                rows: 3,
                width: DefaultTheme.CardBuilder.homeThumbWidth,
                preferThumb: true
            });
        });
    }

    function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Movie",
            Limit: 12,
            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.latestItems(options).then(function (result) {

            var resumeSection = element.querySelector('.latestSection');

            DefaultTheme.CardBuilder.buildCards(result, {
                parentContainer: resumeSection,
                itemsContainer: resumeSection.querySelector('.itemsContainer'),
                shape: 'portraitCard',
                rows: 2,
                width: DefaultTheme.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadSpotlight(element, parentId) {

        var options = {

            SortBy: "Random",
            IncludeItemTypes: "Movie",
            Limit: 20,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop",
            Fields: "Taglines"
        };

        Emby.Models.items(options).then(function (result) {

            var card = element.querySelector('.wideSpotlightCard');

            require([Emby.PluginManager.mapPath('defaulttheme', 'home/spotlight.js')], function () {

                new DefaultTheme.spotlight(card, result.Items, 767);
            });
        });
    }

    function loadRecommendations(element, parentId) {

        Emby.Models.movieRecommendations({

            categoryLimit: 4,
            ItemLimit: 8

        }).then(function (recommendations) {

            Promise.all(recommendations.map(getRecommendationHtml)).then(function(values) {
                
                var recs = element.querySelector('.recommendations');

                if (recs) {
                    recs.innerHTML = values.join('');
                    Emby.ImageLoader.lazyChildren(recs);
                }
            });
        });
    }

    function getRecommendationHtml(recommendation) {

        return new Promise(function (resolve, reject) {

            DefaultTheme.CardBuilder.buildCardsHtml(recommendation.Items, {
                shape: 'portraitCard',
                rows: 2,
                width: DefaultTheme.CardBuilder.homePortraitWidth
            }).then(function (cardsHtml) {

                var html = '';

                var title = '';

                switch (recommendation.RecommendationType) {

                    case 'SimilarToRecentlyPlayed':
                        title = Globalize.translate('RecommendationBecauseYouWatched').replace("{0}", recommendation.BaselineItemName);
                        break;
                    case 'SimilarToLikedItem':
                        title = Globalize.translate('RecommendationBecauseYouLike').replace("{0}", recommendation.BaselineItemName);
                        break;
                    case 'HasDirectorFromRecentlyPlayed':
                    case 'HasLikedDirector':
                        title = Globalize.translate('RecommendationDirectedBy').replace("{0}", recommendation.BaselineItemName);
                        break;
                    case 'HasActorFromRecentlyPlayed':
                    case 'HasLikedActor':
                        title = Globalize.translate('RecommendationStarring').replace("{0}", recommendation.BaselineItemName);
                        break;
                }

                html += '<div class="horizontalSection">';
                html += '<div class="sectionTitle">' + title + '</div>';

                html += '<div class="itemsContainer">';

                html += cardsHtml;

                html += '</div>';
                html += '</div>';

                resolve(html);
            });
        });
    }

    function loadImages(element, parentId) {

        Emby.Models.items({

            SortBy: "IsFavoriteOrLiked,Random",
            IncludeItemTypes: "Movie",
            Limit: 2,
            Recursive: true,
            ParentId: parentId,
            EnableImageTypes: "Backdrop",
            ImageTypes: "Backdrop"

        }).then(function (result) {

            var items = result.Items;
            var imgOptions = {
                maxWidth: 240
            };

            if (items.length > 0) {
                element.querySelector('.movieFavoritesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[0], imgOptions) + "')";
            }

            if (items.length > 1) {
                element.querySelector('.allMoviesCard .cardImage').style.backgroundImage = "url('" + Emby.Models.backdropImageUrl(items[1], imgOptions) + "')";
            }
        });
    }

    function view(element, parentId, autoFocus) {

        var self = this;

        if (autoFocus) {
            Emby.FocusManager.autoFocus(element, true);
        }

        loadResume(element, parentId);
        loadLatest(element, parentId);
        loadSpotlight(element, parentId);
        loadImages(element, parentId);
        loadRecommendations(element, parentId);

        element.querySelector('.allMoviesCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'movies/movies.html?parentid=' + parentId));
        });

        element.querySelector('.movieCollectionsCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'movies/movies.html?tab=collections&parentid=' + parentId));
        });

        element.querySelector('.movieFavoritesCard').addEventListener('click', function () {
            Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'movies/movies.html?tab=favorites&parentid=' + parentId));
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.moviesView = view;

})(this);
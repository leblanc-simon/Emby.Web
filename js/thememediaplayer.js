(function (document) {

    var currentOwnerId;
    var currentThemeIds = [];

    function playThemeSongs(items, ownerId) {

        if (items.length) {

            // Stop if a theme song from another ownerId
            // Leave it alone if anything else (e.g user playing a movie)
            if (!currentOwnerId && Emby.PlaybackManager.isPlaying()) {
                return;
            }

            currentThemeIds = items.map(function (i) {
                return i.Id;
            });

            currentOwnerId = ownerId;

            Emby.PlaybackManager.play({
                items: items
            });

        } else {

            if (currentOwnerId) {
                Emby.PlaybackManager.stop();
            }

            currentOwnerId = null;
        }
    }

    function onPlayItem(item) {

        // User played something manually
        if (currentThemeIds.indexOf(item.Id) == -1) {

            currentOwnerId = null;

        }
    }

    function enabled() {

        return true;
    }

    function loadThemeMedia(item) {

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();
            apiClient.getThemeMedia(apiClient.getCurrentUserId(), item.Id, true).then(function (themeMediaResult) {

                var ownerId = themeMediaResult.ThemeSongsResult.OwnerId;

                if (ownerId != currentOwnerId) {
                    playThemeSongs(themeMediaResult.ThemeSongsResult.Items, ownerId);
                }
            });

        });
    }

    document.addEventListener('viewshow', function (e) {

        var state = e.detail.state || {};
        var item = state.item;

        if (enabled()) {

            if (item) {
                loadThemeMedia(item);
            } else {
                playThemeSongs([], null);
            }
        }

    }, true);

})(document);

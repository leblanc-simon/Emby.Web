(function (document) {

    var currentOwnerId;
    var currentThemeIds = [];

    function playThemeMedia(items, ownerId) {

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
                items: items,
                fullscreen: false
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

                var ownerId = themeMediaResult.ThemeVideosResult.Items.length ? themeMediaResult.ThemeVideosResult.OwnerId : themeMediaResult.ThemeSongsResult.OwnerId;

                if (ownerId != currentOwnerId) {

                    var items = themeMediaResult.ThemeVideosResult.Items.length ? themeMediaResult.ThemeVideosResult.Items : themeMediaResult.ThemeSongsResult.Items;

                    playThemeMedia(items, ownerId);
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
            }
            else if (e.detail.id == 'defaulttheme-nowplaying') {
                // Do nothing here, allow it to keep playing
                // TODO: Make this modular for other themes
            }
            else {
                playThemeMedia([], null);
            }
        }

    }, true);

})(document);

(function (globalScope) {

    function loadLatest(element, parentId) {

        var options = {

            IncludeItemTypes: "Audio",
            Limit: 9,
            Fields: "PrimaryImageAspectRatio",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.latestItems(options).then(function (result) {

            var section = element.querySelector('.latestSection');

            DefaultTheme.CardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth
            });
        });
    }

    function loadPlaylists(element, parentId) {

        var options = {

            SortBy: "SortName",
            SortOrder: "Ascending",
            IncludeItemTypes: "Playlist",
            Recursive: true,
            ParentId: parentId,
            Fields: "PrimaryImageAspectRatio,SortName,CumulativeRunTimeTicks,CanDelete",
            StartIndex: 0,
            Limit: 9
        };

        Emby.Models.playlists(options).then(function (result) {

            var section = element.querySelector('.playlistsSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                showTitle: true
            });
        });
    }

    function loadRecentlyPlayed(element, parentId) {

        var options = {

            SortBy: "DatePlayed",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 9,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.recentlyPlayedSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                action: 'instantmix'
            });
        });
    }

    function loadFrequentlyPlayed(element, parentId) {

        var options = {

            SortBy: "PlayCount",
            SortOrder: "Descending",
            IncludeItemTypes: "Audio",
            Limit: 9,
            Recursive: true,
            Fields: "PrimaryImageAspectRatio",
            Filters: "IsPlayed",
            ParentId: parentId,
            ImageTypeLimit: 1,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.frequentlyPlayedSection');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                width: DefaultTheme.CardBuilder.homePortraitWidth,
                action: 'instantmix'
            });
        });
    }

    function gotoMusicView(tab, parentId) {

        Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'music/music.html?tab=' + tab + "&parentid=" + parentId));
    }

    function view(element, parentId, autoFocus) {
        var self = this;

        if (autoFocus) {
            Emby.FocusManager.autoFocus(element, true);
        }

        loadLatest(element, parentId);
        loadPlaylists(element, parentId);
        loadRecentlyPlayed(element, parentId);
        loadFrequentlyPlayed(element, parentId);

        element.querySelector('.artistsCard').addEventListener('click', function () {
            gotoMusicView('albumartists', parentId);
        });

        element.querySelector('.albumsCard').addEventListener('click', function () {
            gotoMusicView('albums', parentId);
        });

        element.querySelector('.genresCard').addEventListener('click', function () {
            gotoMusicView('genres', parentId);
        });

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.musicView = view;

})(this);
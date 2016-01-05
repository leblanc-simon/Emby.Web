define([], function () {

    function updateClock() {

        var date = new Date();
        var time = date.toLocaleTimeString().toLowerCase();

        if (time.indexOf('am') != -1 || time.indexOf('pm') != -1) {

            var hour = date.getHours() % 12;
            var suffix = date.getHours() > 11 ? 'pm' : 'am';
            if (!hour) {
                hour = 12;
            }
            var minutes = date.getMinutes();

            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            time = hour + ':' + minutes + suffix;
        }

        var clock = document.querySelector('.headerClock');

        if (clock) {
            clock.innerHTML = time;
        }
    }

    return function () {

        var self = this;

        self.name = 'Default Theme';
        self.type = 'theme';
        self.packageName = 'defaulttheme';

        self.getHeaderTemplate = function () {
            return Emby.PluginManager.mapPath(self, 'header.html');
        };

        self.getDependencies = function () {

            var list = [
                'css!' + Emby.PluginManager.mapPath(self, 'css/style'),
                'css!' + Emby.PluginManager.mapPath(self, 'cards/card'),
                'css!' + Emby.PluginManager.mapPath(self, 'css/colors.dark'),
                'css!' + Emby.PluginManager.mapPath(self, 'css/paperstyles'),
                'css!' + Emby.PluginManager.mapPath(self, 'css/papericonbutton'),
                Emby.PluginManager.mapPath(self, 'backdrop.js'),
                Emby.PluginManager.mapPath(self, 'cards/cardbuilder.js'),
                Emby.PluginManager.mapPath(self, 'cards/userdata.js'),
                Emby.PluginManager.mapPath(self, 'cards/tabbedpage.js'),
                Emby.PluginManager.mapPath(self, 'cards/horizontallist.js')
            ];

            list.push('css!' + Emby.PluginManager.mapPath(self, 'css/fonts'));

            list.push('html!' + Emby.PluginManager.mapPath(self, 'icons.html'));
            list.push('paper-button');
            list.push('paper-icon-button');
            list.push('paper-input');
            list.push('paper-fab');
            list.push('paper-slider');
            list.push('paper-icon-item');
            list.push('paper-item-body');

            return list;
        };

        self.getTranslations = function () {

            var files = [];

            files.push({
                lang: 'en-us',
                path: Emby.PluginManager.mapPath(self, 'strings/en-us.json')
            });

            return files;
        };

        self.getRoutes = function () {

            var routes = [];

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'home.html'),
                id: 'defaulttheme-home',
                transition: 'slide',
                type: 'home',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'home/home.js'),
                    'css!' + Emby.PluginManager.mapPath(self, 'home/home.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'item/item.html'),
                id: 'defaulttheme-item',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'item/item.js'),
                    'css!' + Emby.PluginManager.mapPath(self, 'item/item.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'list/list.html'),
                id: 'defaulttheme-list',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'list/list.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'music/music.html'),
                id: 'defaulttheme-music',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'music/music.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'movies/movies.html'),
                id: 'defaulttheme-movies',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'movies/movies.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'livetv/livetv.html'),
                id: 'defaulttheme-livetv',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'livetv/livetv.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'livetv/guide.html'),
                id: 'defaulttheme-guide',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'livetv/guide.js'),
                    'css!' + Emby.PluginManager.mapPath(self, 'livetv/guide.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'tv/tv.html'),
                id: 'defaulttheme-tv',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'tv/tv.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'tv/favorites.html'),
                id: 'defaulttheme-tvfavorites',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'tv/favorites.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'tv/upcoming.html'),
                id: 'defaulttheme-tvupcoming',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'tv/upcoming.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'search/search.html'),
                id: 'defaulttheme-search',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'search/search.js'),
                    'css!' + Emby.PluginManager.mapPath(self, 'search/search.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'nowplaying/nowplaying.html'),
                id: 'defaulttheme-nowplaying',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'nowplaying/nowplaying.js'),
                    'css!' + Emby.PluginManager.mapPath(self, 'nowplaying/nowplaying.css')
                ],
                supportsThemeMedia: true
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'nowplaying/playlist.html'),
                id: 'defaulttheme-nowplayingplaylist',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'nowplaying/playlist.js'),
                    'css!' + Emby.PluginManager.mapPath(self, 'item/item.css')
                ],
                supportsThemeMedia: true
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'nowplaying/videoosd.html'),
                id: 'defaulttheme-videoosd',
                transition: 'fade',
                dependencies: [
                    Emby.PluginManager.mapPath(self, 'nowplaying/videoosd.js'),
                    'css!' + Emby.PluginManager.mapPath(self, 'nowplaying/videoosd.css')
                ],
                type: 'video-osd',
                supportsThemeMedia: true
            });

            //routes.push({
            //    path: Emby.PluginManager.mapPath(self, 'settings/settings.html'),
            //    id: 'defaulttheme-settings',
            //    transition: 'slide',
            //    dependencies: [
            //        Emby.PluginManager.mapPath(self, 'settings/settings.js')
            //    ],
            //    type: 'settings',
            //    title: 'Default Theme',
            //    category: 'Theme',
            //    thumbImage: ''
            //});

            return routes;
        };

        var clockInterval;
        self.load = function () {

            updateClock();
            setInterval(updateClock, 50000);
            bindEvents();
        };

        self.unload = function () {

            unbindEvents();

            if (clockInterval) {
                clearInterval(clockInterval);
                clockInterval = null;
            }
        };

        self.getHomeRoute = function () {
            return Emby.PluginManager.mapPath(self, 'home.html');
        };

        self.getVideoOsdRoute = function () {
            return Emby.PluginManager.mapPath(self, 'nowplaying/videoosd.html');
        };

        self.showItem = function (item) {

            var showList = false;

            if (item.IsFolder) {

                if (item.Type != 'Series' && item.Type != 'Season' && item.Type != 'MusicAlbum' && item.Type != 'MusicArtist' && item.Type != 'Playlist' && item.Type != 'BoxSet') {
                    showList = true;
                }
            }

            if (showList) {
                Emby.Page.show(Emby.PluginManager.mapPath(self, 'list/list.html') + '?parentid=' + item.Id, { item: item });
            } else {
                Emby.Page.show(Emby.PluginManager.mapPath(self, 'item/item.html') + '?id=' + item.Id, { item: item });
            }
        };

        self.setTitle = function (title) {

            if (title == null) {
                document.querySelector('.headerLogo').classList.remove('hide');
            } else {
                document.querySelector('.headerLogo').classList.add('hide');
            }

            title = title || '&nbsp;';

            var pageTitle = document.querySelector('.pageTitle');
            pageTitle.classList.remove('pageTitleWithLogo');
            pageTitle.style.backgroundImage = null;
            pageTitle.innerHTML = title;
        };

        self.search = function () {

            Emby.Page.show(Emby.PluginManager.mapPath(self, 'search/search.html'));
        };

        self.showNowPlaying = function () {
            Emby.Page.show(Emby.PluginManager.mapPath(self, 'nowplaying/nowplaying.html'));
        };

        self.showUserMenu = function () {

            // For now just go cheap
            showBackMenuInternal(function () { }, true);
        };

        self.showBackMenu = function (callback) {

            showBackMenuInternal(callback, false);
        };

        function showBackMenuInternal(callback, showHome) {

            require([Emby.PluginManager.mapPath(self, 'backmenu/backmenu.js'), 'css!' + Emby.PluginManager.mapPath(self, 'backmenu/backmenu.css')], function () {
                DefaultTheme.BackMenu.show({
                    callback: callback,
                    showHome: showHome
                });
            });
        }

        function bindEvents() {

            document.querySelector('.headerSearchButton').addEventListener('click', function () {
                self.search();
            });

            document.querySelector('.headerAudioPlayerButton').addEventListener('click', function () {
                self.showNowPlaying();
            });

            document.querySelector('.headerUserButton').addEventListener('click', function () {
                self.showUserMenu();
            });

            document.addEventListener('usersignedin', onLocalUserSignedIn);
            document.addEventListener('usersignedout', onLocalUserSignedOut);
            document.addEventListener('viewshow', onViewShow);

            Events.on(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.on(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
        }

        function unbindEvents() {

            document.removeEventListener('usersignedin', onLocalUserSignedIn);
            document.removeEventListener('usersignedout', onLocalUserSignedOut);
            document.removeEventListener('viewshow', onViewShow);

            Events.off(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
        }

        function onPlaybackStart(e) {

            if (Emby.PlaybackManager.isPlayingAudio()) {
                document.querySelector('.headerAudioPlayerButton').classList.remove('hide');
            } else {
                document.querySelector('.headerAudioPlayerButton').classList.add('hide');
            }
        }

        function onPlaybackStop(e, stopInfo) {

            if (stopInfo.nextMediaType != 'Audio') {
                document.querySelector('.headerAudioPlayerButton').classList.add('hide');
            }
        }

        function onLocalUserSignedIn(e) {

            var user = e.detail.user;

            document.querySelector('.headerLogo').classList.add('hide');

            document.querySelector('.headerSearchButton').classList.remove('hide');

            var headerUserButton = document.querySelector('.headerUserButton');

            if (user.PrimaryImageTag) {

                headerUserButton.icon = null;
                headerUserButton.src = Emby.Models.userImageUrl(user, {
                    height: 44
                });

            } else {
                headerUserButton.src = null;
                headerUserButton.icon = 'person';
            }

            document.querySelector('.headerUserButton').classList.remove('hide');
        }

        function onLocalUserSignedOut(e) {

            // Put the logo back in the page title
            document.querySelector('.headerLogo').classList.remove('hide');

            document.querySelector('.headerSearchButton').classList.add('hide');
            document.querySelector('.headerUserButton').classList.add('hide');
        }

        function onViewShow(e) {

            var viewId = e.detail.id;

            if (Emby.Page.canGoBack()) {
                document.querySelector('.headerBackButton').classList.remove('hide');
            } else {
                document.querySelector('.headerBackButton').classList.add('hide');
            }

            var enableSubduedBackdrop = viewId != 'defaulttheme-item' && viewId != 'defaulttheme-nowplaying' && viewId != 'defaulttheme-nowplayingplaylist';
            DefaultTheme.Backdrop.subdued(enableSubduedBackdrop);
            //blurBackdrop(enableBlur);
            //Emby.Backdrop.setBackdrop(Emby.PluginManager.mapPath(self, 'css/skin-dark/blur6.png'));
        }

        function blurBackdrop(enabled) {

            var elem = document.documentElement;
            if (enabled) {

                if (!elem.classList.contains('blurBackdropIn')) {
                    elem.classList.remove('blurBackdropOut');
                    elem.classList.add('blurBackdropIn');
                }

            } else {

                if (elem.classList.contains('blurBackdropIn')) {
                    elem.classList.remove('blurBackdropIn');
                    elem.classList.add('blurBackdropOut');
                }
            }
        }
    }
});
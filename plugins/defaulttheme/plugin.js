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

        var clock = document.querySelector('.clock');

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
            return Emby.PluginManager.mapResource(self, 'header.html');
        };

        self.getDependencies = function () {

            var list = [
                'css!' + Emby.PluginManager.mapRequire(self, 'css/style'),
                'css!' + Emby.PluginManager.mapRequire(self, 'cards/card'),
                'css!' + Emby.PluginManager.mapRequire(self, 'css/colors.dark'),
                'css!' + Emby.PluginManager.mapRequire(self, 'css/paperstyles'),
                'css!' + Emby.PluginManager.mapRequire(self, 'css/papericonbutton'),
                Emby.PluginManager.mapRequire(self, 'backdrop.js'),
                Emby.PluginManager.mapRequire(self, 'cards/cardbuilder.js'),
                Emby.PluginManager.mapRequire(self, 'cards/userdata.js'),
                Emby.PluginManager.mapRequire(self, 'cards/tabbedpage.js'),
                Emby.PluginManager.mapRequire(self, 'cards/horizontallist.js')
            ];

            list.push('css!' + Emby.PluginManager.mapRequire(self, 'css/fonts'));

            if (Emby.Dom.supportsWebComponents()) {
                list.push('html!' + Emby.PluginManager.mapRequire(self, 'icons.html'));
                list.push('paper-button');
                list.push('paper-icon-button');
                list.push('paper-input');
                list.push('paper-fab');
                list.push('paper-slider');
                list.push('html!bower_components/paper-item/paper-icon-item.html');
                list.push('html!bower_components/paper-item/paper-item-body.html');
            }

            return list;
        };

        self.getTranslations = function () {

            var files = [];

            files.push({
                lang: 'en-us',
                path: Emby.PluginManager.mapResource(self, 'strings/en-us.json')
            });

            return files;
        };

        self.getRoutes = function () {
            // Routes, relative to the current directory. The app will handle normalizing the full path

            var routes = [];

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'home.html'),
                id: 'defaulttheme-home',
                transition: 'slide',
                type: 'home',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'home/home.js'),
                    'css!' + Emby.PluginManager.mapRequire(self, 'home/home.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'item/item.html'),
                id: 'defaulttheme-item',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'item/item.js'),
                    'css!' + Emby.PluginManager.mapRequire(self, 'item/item.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'list/list.html'),
                id: 'defaulttheme-list',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'list/list.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'music/music.html'),
                id: 'defaulttheme-music',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'music/music.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'movies/movies.html'),
                id: 'defaulttheme-movies',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'movies/movies.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'livetv/livetv.html'),
                id: 'defaulttheme-livetv',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'livetv/livetv.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'livetv/guide.html'),
                id: 'defaulttheme-guide',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'livetv/guide.js'),
                    'css!' + Emby.PluginManager.mapRequire(self, 'livetv/guide.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'tv/tv.html'),
                id: 'defaulttheme-tv',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'tv/tv.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'search/search.html'),
                id: 'defaulttheme-search',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'search/search.js'),
                    'css!' + Emby.PluginManager.mapRequire(self, 'search/search.css')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'nowplaying/nowplaying.html'),
                id: 'defaulttheme-nowplaying',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'nowplaying/nowplaying.js')
                ]
            });

            routes.push({
                path: Emby.PluginManager.mapPath(self, 'nowplaying/playlist.html'),
                id: 'defaulttheme-nowplayingplaylist',
                transition: 'slide',
                dependencies: [
                    Emby.PluginManager.mapRequire(self, 'nowplaying/playlist.js'),
                    'css!' + Emby.PluginManager.mapRequire(self, 'item/item.css')
                ]
            });

            return routes;
        };

        var clockInterval;
        self.load = function () {

            if (window.navigator.msPointerEnabled) {
                document.documentElement.classList.add('noflex');
            }

            updateClock();
            setInterval(updateClock, 50000);
            bindEvents();
            loadControlBox();
        };

        self.unload = function () {

            document.documentElement.classList.remove('noflex');
            unbindEvents();

            if (clockInterval) {
                clearInterval(clockInterval);
                clockInterval = null;
            }
        };

        self.goHome = function () {
            Emby.Page.show(Emby.PluginManager.mapPath(self, 'home.html'));
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
                document.querySelector('.logo').classList.remove('hide');
            } else {
                document.querySelector('.logo').classList.add('hide');
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

        function loadControlBox() {

            require(['apphost'], function (apphost) {
                updateWindowState(apphost.getWindowState());
            });
        }

        function bindEvents() {

            document.addEventListener('windowstatechanged', onWindowStateChanged);

            document.querySelector('.appExitButton').addEventListener('click', function () {
                require(['apphost'], function (apphost) {
                    apphost.exit();
                });
            });

            document.querySelector('.minimizeButton').addEventListener('click', function () {
                require(['apphost'], function (apphost) {
                    apphost.setWindowState('Minimized');
                });
            });

            document.querySelector('.fullscreenExitButton').addEventListener('click', function () {
                require(['apphost'], function (apphost) {
                    apphost.setWindowState('Normal');
                });
            });

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

            document.removeEventListener('windowstatechanged', onWindowStateChanged);
            document.removeEventListener('usersignedin', onLocalUserSignedIn);
            document.removeEventListener('usersignedout', onLocalUserSignedOut);
            document.removeEventListener('viewshow', onViewShow);

            Events.off(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
        }

        function onPlaybackStart(e, player) {

            if (Emby.PlaybackManager.currentItem(player).MediaType == 'Audio') {
                document.querySelector('.headerAudioPlayerButton').classList.remove('hide');
            } else {
                document.querySelector('.headerAudioPlayerButton').classList.add('hide');
            }
        }

        function onPlaybackStop() {
            document.querySelector('.headerAudioPlayerButton').classList.add('hide');
        }

        function onWindowStateChanged(e) {
            updateWindowState(e.detail.windowState);
        }

        function updateWindowState(windowState) {

            if (windowState == 'Maximized') {
                document.querySelector('.controlBox').classList.remove('hide');
            } else {
                document.querySelector('.controlBox').classList.add('hide');
            }
        }

        function onLocalUserSignedIn(e) {

            var user = e.detail.user;

            document.querySelector('.logo').classList.add('hide');

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
            document.querySelector('.logo').classList.remove('hide');

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
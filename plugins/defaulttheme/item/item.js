(function () {

    document.addEventListener("viewinit-defaulttheme-item", function (e) {

        new itemPage(e.target, e.detail.params);
    });

    function itemPage(view, params) {

        var self = this;
        var currentItem;

        view.addEventListener('viewshow', function (e) {

            var isRestored = e.detail.isRestored;

            require(['loading'], function (loading) {

                if (!isRestored) {
                    loading.show();
                }

                Emby.Models.item(params.id).then(function (item) {

                    currentItem = item;

                    // If it's a person, leave the backdrop image from wherever we came from
                    if (item.Type != 'Person') {
                        DefaultTheme.Backdrop.setBackdrops([item]);
                        setTitle(item);
                    }

                    var userDataIconsSelector = enableTrackList(item) || item.Type == 'MusicArtist' ? '.itemPageFixedLeft .itemPageUserDataIcons' : '.mainSection .itemPageUserDataIcons';
                    view.querySelector(userDataIconsSelector).innerHTML = DefaultTheme.UserData.getIconsHtml(item, true, "mediumSizeIcon");

                    if (!isRestored) {
                        renderName(view, item);
                        renderImage(view, item);
                        renderChildren(view, item);
                        renderDetails(view, item);
                        renderMediaInfoIcons(view, item);
                        renderPeople(view, item);
                        renderScenes(view, item);
                        renderSimilar(view, item);
                        createVerticalScroller(view, self);

                        var mainSection = view.querySelector('.mainSection');
                        var itemScrollFrame = view.querySelector('.itemScrollFrame');

                        if (enableTrackList(item) || item.Type == 'MusicArtist') {
                            mainSection.classList.remove('focusable');
                            itemScrollFrame.classList.add('clippedLeft');
                            view.querySelector('.itemPageFixedLeft').classList.remove('hide');
                        } else {
                            mainSection.classList.add('focusable');
                            itemScrollFrame.classList.remove('clippedLeft');
                            view.querySelector('.itemPageFixedLeft').classList.add('hide');
                            mainSection.focus = focusMainSection;
                        }

                        if (item.Type == 'Person') {
                            mainSection.classList.add('miniMainSection');
                        } else {
                            mainSection.classList.remove('miniMainSection');
                        }

                        if (enableTrackList(item) || item.Type == 'MusicArtist') {
                            Emby.FocusManager.autoFocus(view, true);
                        } else {
                            focusMainSection.call(mainSection);
                        }
                    }

                    // Always refresh this
                    renderNextUp(view, item);

                    if (Emby.PlaybackManager.canQueue(item)) {
                        view.querySelector('.itemPageFixedLeft .btnQueue').classList.remove('hide');
                    } else {
                        view.querySelector('.itemPageFixedLeft .btnQueue').classList.add('hide');
                    }

                    loading.hide();
                });
            });

            if (!isRestored) {

                view.querySelector('.itemPageFixedLeft .btnPlay').addEventListener('click', play);
                view.querySelector('.mainSection .btnPlay').addEventListener('click', play);

                view.querySelector('.itemPageFixedLeft .btnQueue').addEventListener('click', queue);

                view.querySelector('.btnTrailer').addEventListener('click', playTrailer);
                view.querySelector('.btnInstantMix').addEventListener('click', instantMix);

                view.querySelector('.itemPageFixedLeft .btnShuffle').addEventListener('click', shuffle);
                view.querySelector('.mainSection .btnShuffle').addEventListener('click', shuffle);
            }
        });

        view.addEventListener('viewdestroy', function () {

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null
            }
            if (self.slyFrame) {
                self.slyFrame.destroy();
            }
        });

        function playTrailer() {
            Emby.PlaybackManager.playTrailer(currentItem);
        }

        function play() {

            if (currentItem.IsFolder) {
                Emby.PlaybackManager.play({
                    items: [currentItem]
                });
            } else {
                require(['playmenu'], function (playmenu) {
                    playmenu.show(currentItem);
                });
            }
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
    }

    function focusMainSection() {

        Emby.FocusManager.autoFocus(this, true);
    }

    function setTitle(item) {

        var url = Emby.Models.logoImageUrl(item, {});

        if (item.Type == 'BoxSet') {
            Emby.Page.setTitle(item.Name);
        }
        else if (url) {

            var pageTitle = document.querySelector('.pageTitle');
            pageTitle.style.backgroundImage = "url('" + url + "')";
            pageTitle.classList.add('pageTitleWithLogo');
            pageTitle.innerHTML = '';
            document.querySelector('.headerLogo').classList.add('hide');
        } else {
            Emby.Page.setTitle('');
        }
    }

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
                scrollBar: view.querySelector('.scrollbar'),
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
                zoomScale: '1.10',
                enableBackdrops: false
            });

        });
    }

    function renderName(view, item) {

        var itemTitle = view.querySelector('.itemTitle');

        if (item.Type == 'BoxSet') {
            itemTitle.classList.add('hide');
        } else {
            itemTitle.classList.remove('hide');
            itemTitle.innerHTML = DefaultTheme.CardBuilder.getDisplayName(item);
        }

        if (enableTrackList(item) || item.Type == 'MusicArtist') {
            itemTitle.classList.add('albumTitle');
        } else {
            itemTitle.classList.remove('albumTitle');
        }
    }

    function renderImage(view, item) {

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.getApiClient(item.ServerId);

            var imageTags = item.ImageTags || {};
            var imageWidth = 700;
            var url;

            if (imageTags.Primary) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.ImageTags.Primary
                });
            }
            else if (imageTags.Thumb) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Thumb",
                    width: imageWidth,
                    tag: item.ImageTags.Thumb
                });
            }
            else if (imageTags.Disc) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Disc",
                    width: imageWidth,
                    tag: item.ImageTags.Disc
                });
            }
            else if (item.AlbumId && item.AlbumPrimaryImageTag) {

                url = apiClient.getScaledImageUrl(item.AlbumId, {
                    type: "Primary",
                    width: imageWidth,
                    tag: item.AlbumPrimaryImageTag
                });
            }
            else if (item.BackdropImageTags && item.BackdropImageTags.length) {

                url = apiClient.getScaledImageUrl(item.Id, {
                    type: "Backdrop",
                    width: imageWidth,
                    tag: item.BackdropImageTags[0]
                });
            }

            var detailImage = enableTrackList(item) || item.Type == 'MusicArtist' ? view.querySelector('.leftFixedDetailImageContainer') : view.querySelector('.detailImageContainer');

            if (url && item.Type != "Season" && item.Type != "BoxSet") {
                detailImage.classList.remove('hide');
                detailImage.innerHTML = '<img class="detailImage" src="' + url + '" />' + DefaultTheme.CardBuilder.getProgressBarHtml(item);
            } else {
                detailImage.classList.add('hide');
                detailImage.innerHTML = '';
            }
        });
    }

    function enableTrackList(item) {
        return item.Type == "MusicAlbum" || item.Type == "Playlist";
    }

    function renderMediaInfoIcons(view, item) {

        var showMediaInfoIcons = false;

        if (item.VideoType == 'Dvd') {
            view.querySelector('.dvdIcon').classList.remove('hide');
            showMediaInfoIcons = true;
        } else {
            view.querySelector('.dvdIcon').classList.add('hide');
        }

        if (item.VideoType == 'BluRay') {
            view.querySelector('.blurayIcon').classList.remove('hide');
            showMediaInfoIcons = true;
        } else {
            view.querySelector('.blurayIcon').classList.add('hide');
        }

        var audioIcons = [
            {
                codec: 'ac3',
                cssClass: 'dolbyIcon'
            },
            {
                codec: 'truehd',
                cssClass: 'truehdIcon'
            },
            {
                codec: 'dts',
                cssClass: 'dtsIcon'
            }
        ];

        audioIcons.map(function (i) {

            if (hasCodec(item, 'Audio', i.codec)) {
                view.querySelector('.' + i.cssClass).classList.remove('hide');
                showMediaInfoIcons = true;
            } else {
                view.querySelector('.' + i.cssClass).classList.add('hide');
            }

        });

        var channels = getChannels(item);
        var mediaInfoChannels = view.querySelector('.mediaInfoChannels');
        var channelText;

        if (channels == 8) {

            channelText = '7.1';

        } else if (channels == 7) {

            channelText = '6.1';

        } else if (channels == 6) {

            channelText = '5.1';

        } else if (channels == 2) {

            channelText = '2.0';
        }

        if (channelText) {
            mediaInfoChannels.classList.remove('hide');
            mediaInfoChannels.innerHTML = channelText;
            showMediaInfoIcons = true;
        } else {
            mediaInfoChannels.classList.add('hide');
        }

        var resolutionText = getResolutionText(item);

        var mediaInfoResolution = view.querySelector('.mediaInfoResolution');
        if (resolutionText) {
            mediaInfoResolution.classList.remove('hide');
            mediaInfoResolution.innerHTML = resolutionText;
            showMediaInfoIcons = true;
        } else {
            mediaInfoResolution.classList.add('hide');
        }

        if (showMediaInfoIcons) {
            view.querySelector('.mediaInfoIcons').classList.remove('hide');
        } else {
            view.querySelector('.mediaInfoIcons').classList.add('hide');
        }
    }

    function getResolutionText(item) {

        if (!item.MediaSources || !item.MediaSources.length) {
            return null;
        }

        return item.MediaSources[0].MediaStreams.filter(function (i) {

            return i.Type == 'Video';

        }).map(function (i) {

            if (i.Height) {
                
                if (i.Height >= 2000) {
                    return '4K';
                }
                if (i.Height >= 1400) {
                    return '1440P';
                }
                if (i.Height >= 1060) {
                    return '1080P';
                }
                if (i.Height >= 700) {
                    return '720P';
                }
                if (i.Height >= 460) {
                    return '480P';
                }

            }
            return null;
        })[0];

    }

    function getChannels(item) {

        if (!item.MediaSources || !item.MediaSources.length) {
            return 0;
        }

        return item.MediaSources[0].MediaStreams.filter(function (i) {

            return i.Type == 'Audio';

        }).map(function (i) {
            return i.Channels;
        })[0];

    }

    function hasCodec(item, streamType, codec) {

        if (!item.MediaSources || !item.MediaSources.length) {
            return false;
        }

        return item.MediaSources[0].MediaStreams.filter(function (i) {

            return i.Type == streamType && ((i.Codec || '').toLowerCase() == codec || (i.Profile || '').toLowerCase() == codec);

        }).length > 0;

    }

    function renderDetails(view, item) {

        var mainSection = view.querySelector('.mainSection');

        if (item.Type == "Person") {
            mainSection.classList.add('smallBottomMargin');
        }
        else if (item.Type != "Season" && item.Type != "MusicArtist" && item.Type != "MusicAlbum" && item.Type != "BoxSet" && item.Type != "Playlist") {
            mainSection.style.minHeight = (Math.round(view.querySelector('.itemPageContainer').offsetHeight * .78)) + 'px';
            mainSection.classList.add('smallBottomMargin');
        } else {
            mainSection.classList.remove('smallBottomMargin');
        }

        if (item.Type == "Season" || item.Type == "BoxSet") {
            mainSection.classList.add('seasonMainSection');
        }
        else if (item.Type == "MusicArtist" || enableTrackList(item)) {
            mainSection.classList.add('albumMainSection');
        }

        var taglineElem = view.querySelector('.tagline')
        if (item.Taglines && item.Taglines.length) {
            taglineElem.classList.remove('hide');
            taglineElem.innerHTML = item.Taglines[0];
        } else {
            taglineElem.classList.add('hide');
        }

        var overviewElem = view.querySelector('.overview')
        if (item.Overview && item.Type != 'MusicArtist' && item.Type != 'MusicAlbum' && item.Type != 'Season' && item.Type != 'BoxSet') {
            overviewElem.classList.remove('hide');
            overviewElem.innerHTML = item.Overview;
        } else {
            overviewElem.classList.add('hide');
        }

        if (item.LocalTrailerCount) {
            view.querySelector('.btnTrailer').classList.remove('hide');
        } else {
            view.querySelector('.btnTrailer').classList.add('hide');
        }

        if (Emby.PlaybackManager.canPlay(item)) {
            view.querySelector('.itemPageFixedLeft .btnPlay').classList.remove('hide');
            view.querySelector('.mainSection .btnPlay').classList.remove('hide');
        } else {
            view.querySelector('.itemPageFixedLeft .btnPlay').classList.add('hide');
            view.querySelector('.mainSection .btnPlay').classList.add('hide');
        }

        if (enableTrackList(item) || item.Type == 'MusicArtist') {
            view.querySelector('.itemPageFixedLeft .itemPageButtons').classList.remove('hide');
            view.querySelector('.mainSection .itemPageButtons').classList.add('hide');
        } else {
            view.querySelector('.itemPageFixedLeft .itemPageButtons').classList.add('hide');
            view.querySelector('.mainSection .itemPageButtons').classList.remove('hide');
        }

        var mediaInfoHtml = item.Type == 'Season' || item.Type == 'BoxSet' ? '' : DefaultTheme.CardBuilder.getMediaInfoHtml(item);
        var mediaInfoElem = view.querySelector('.mediaInfo');

        if (!mediaInfoHtml) {
            mediaInfoElem.classList.add('hide');
        } else {
            mediaInfoElem.classList.remove('hide');
            mediaInfoElem.innerHTML = mediaInfoHtml;
        }

        var genres = [];
        var genresHtml = genres.map(function (i) {

            return i;

        }).join('<span class="bulletSeparator"> &bull; </span>');

        var genresElem = view.querySelector('.genres')

        if (!genresHtml) {
            genresElem.classList.add('hide');
        } else {
            genresElem.classList.remove('hide');
            genresElem.innerHTML = genresHtml;
        }

        if (item.IsFolder) {

            view.querySelector('.itemPageFixedLeft .btnPlayText').innerHTML = Globalize.translate("PlayAll");
            view.querySelector('.mainSection .btnPlayText').innerHTML = Globalize.translate("PlayAll");
            view.querySelector('.itemPageFixedLeft .btnShuffle').classList.remove('hide');
            view.querySelector('.mainSection .btnShuffle').classList.remove('hide');

        } else {
            view.querySelector('.itemPageFixedLeft .btnPlayText').innerHTML = Globalize.translate("Play");
            view.querySelector('.mainSection .btnPlayText').innerHTML = Globalize.translate("Play");
            view.querySelector('.itemPageFixedLeft .btnShuffle').classList.add('hide');
            view.querySelector('.mainSection .btnShuffle').classList.add('hide');
        }

        if (item.Type == "MusicArtist" || item.Type == "MusicAlbum" || item.Type == "MusicGenre" || item.Type == "Playlist" || item.MediaType == "Audio") {
            view.querySelector('.btnInstantMix').classList.remove('hide');
        } else {
            view.querySelector('.btnInstantMix').classList.add('hide');
        }

        var birthDateElem = view.querySelector('.birthDate');
        if (item.PremiereDate && item.Type == 'Person') {
            birthDateElem.classList.remove('hide');
            var dateString = Emby.DateTime.parseISO8601Date(item.PremiereDate).toDateString();
            birthDateElem.innerHTML = Globalize.translate('BornValue', dateString);
        } else {
            birthDateElem.classList.add('hide');
        }

        var birthPlaceElem = view.querySelector('.birthPlace');
        if (item.Type == "Person" && item.ProductionLocations && item.ProductionLocations.length) {
            birthPlaceElem.classList.remove('hide');
            birthPlaceElem.innerHTML = Globalize.translate('BirthPlaceValue').replace('{0}', item.ProductionLocations[0]);
        } else {
            birthPlaceElem.classList.add('hide');
        }
    }

    function renderNextUp(view, item) {

        var section = view.querySelector('.nextUpSection');

        var userData = item.UserData || {};

        if (item.Type != 'Series' || !userData.PlayedPercentage) {
            section.classList.add('hide');
            return;
        }

        Emby.Models.nextUp({

            SeriesId: item.Id

        }).then(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                width: DefaultTheme.CardBuilder.homeThumbWidth,
                showTitle: true,
                scalable: true
            });
        });
    }

    function renderTrackList(view, item) {

        var section = view.querySelector('.trackList');

        if (!enableTrackList(item)) {
            section.classList.add('hide');
            return;
        }

        if (!item.ChildCount) {
            section.classList.add('hide');
            return;
        }

        Emby.Models.children(item, {

            SortBy: 'SortName'

        }).then(function (result) {

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            section.innerHTML = DefaultTheme.CardBuilder.getListViewHtml(result.Items, {
                showIndexNumber: item.Type == 'MusicAlbum',
                action: 'playallfromhere',
                showParentTitle: true,
                enableSideMediaInfo: true
            });

            Emby.ImageLoader.lazyChildren(section);
        });
    }

    function renderPeopleItems(view, item) {

        var section = view.querySelector('.peopleItems');

        if (item.Type != "Person") {
            section.classList.add('hide');
            return;
        }
        section.classList.remove('hide');

        var sections = [];

        if (item.MovieCount) {

            sections.push({
                name: Globalize.translate('Movies'),
                type: 'Movie'
            });
        }

        if (item.SeriesCount) {

            sections.push({
                name: Globalize.translate('Series'),
                type: 'Series'
            });
        }

        if (item.EpisodeCount) {

            sections.push({
                name: Globalize.translate('Episodes'),
                type: 'Episode'
            });
        }

        if (item.TrailerCount) {

            sections.push({
                name: Globalize.translate('Trailers'),
                type: 'Trailer'
            });
        }

        if (item.GameCount) {

            sections.push({
                name: Globalize.translate('Games'),
                type: 'Game'
            });
        }

        if (item.AlbumCount) {

            sections.push({
                name: Globalize.translate('Albums'),
                type: 'MusicAlbum'
            });
        }

        if (item.SongCount) {

            sections.push({
                name: Globalize.translate('Songs'),
                type: 'Audio'
            });
        }

        if (item.MusicVideoCount) {

            sections.push({
                name: Globalize.translate('MusicVideos'),
                type: 'MusicVideo'
            });
        }

        section.innerHTML = sections.map(function (section) {

            var html = '';

            html += '<div class="itemSection personSection" data-type="' + section.type + '">';

            html += '<h2>';
            html += section.name;
            html += '</h2>';

            html += '<div class="itemsContainer">';
            html += '</div>';

            html += '</div>';

            return html;

        }).join('');

        var sectionElems = section.querySelectorAll('.personSection');
        for (var i = 0, length = sectionElems.length; i < length; i++) {
            renderPersonSection(view, item, sectionElems[i], sectionElems[i].getAttribute('data-type'));
        }
    }

    function renderPersonSection(view, item, element, type) {

        switch (type) {

            case 'Movie':
                loadPeopleItems(element, item, type, {
                    MediaTypes: "",
                    IncludeItemTypes: "Movie",
                    PersonTypes: "",
                    ArtistIds: ""
                }, {
                    shape: "autoVertical"
                });
                break;

            case 'MusicVideo':
                loadPeopleItems(element, item, type, {
                    MediaTypes: "",
                    IncludeItemTypes: "MusicVideo",
                    PersonTypes: "",
                    ArtistIds: ""
                }, {
                    shape: "autoVertical",
                    showTitle: true
                });
                break;

            case 'Game':
                loadPeopleItems(element, item, type, {
                    MediaTypes: "",
                    IncludeItemTypes: "Game",
                    PersonTypes: "",
                    ArtistIds: ""
                }, {
                    shape: "autoVertical"
                });
                break;

            case 'Trailer':
                loadPeopleItems(element, item, type, {
                    MediaTypes: "",
                    IncludeItemTypes: "Trailer",
                    PersonTypes: "",
                    ArtistIds: ""
                }, {
                    shape: "autoVertical"
                });
                break;

            case 'Series':
                loadPeopleItems(element, item, type, {
                    MediaTypes: "",
                    IncludeItemTypes: "Series",
                    PersonTypes: "",
                    ArtistIds: ""
                }, {
                    shape: "autoVertical"
                });
                break;

            case 'MusicAlbum':
                loadPeopleItems(element, item, type, {
                    MediaTypes: "",
                    IncludeItemTypes: "MusicAlbum",
                    PersonTypes: "",
                    ArtistIds: ""
                }, {
                    shape: "autoVertical",
                    playFromHere: true
                });
                break;

            case 'Episode':
                loadPeopleItems(element, item, type, {
                    MediaTypes: "",
                    IncludeItemTypes: "Episode",
                    PersonTypes: "",
                    ArtistIds: "",
                    Limit: 50
                }, {
                    shape: "autoVertical",
                    showTitle: true,
                    showParentTitle: true
                });
                break;

            default:
                break;
        }
    }

    function loadPeopleItems(element, item, type, query, listOptions) {

        query.SortBy = "SortName";
        query.SortOrder = "Ascending";
        query.Recursive = true;
        query.CollapseBoxSetItems = false;

        query.PersonIds = item.Id;

        Emby.Models.items(query).then(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: element,
                itemsContainer: element.querySelector('.itemsContainer'),
                shape: listOptions.shape,
                scalable: true,
                showTitle: listOptions.showTitle,
                showParentTitle: listOptions.showParentTitle
            });
        });
    }

    function renderEpisodes(view, item) {

        var section = view.querySelector('.episodes');

        if (item.Type != "Season") {
            section.classList.add('hide');
            return;
        }

        Emby.Models.children(item, {

            SortBy: 'SortName',
            Fields: "Overview"

        }).then(function (result) {

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            section.innerHTML = DefaultTheme.CardBuilder.getListViewHtml(result.Items, {
                showIndexNumber: item.Type == 'MusicAlbum',
                action: 'playallfromhere',
                enableOverview: true,
                imageSize: 'large'
            });

            Emby.ImageLoader.lazyChildren(section);

            focusFirstUnWatched(result.Items, section);

            section.removeEventListener('keydown', onEpisodeListKeyDown);
            section.addEventListener('keydown', onEpisodeListKeyDown);
        });
    }

    function onEpisodeListKeyDown(e) {

        // 39
        if (e.keyCode == 39) {

            var card = Emby.Dom.parentWithClass(e.target, 'itemAction');

            if (card) {

                Emby.Page.showItem(card.getAttribute('data-id'));

                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
    }

    function focusFirstUnWatched(items, element) {

        var focusItem = items.filter(function (i) {

            return !i.UserData.Played;

        })[0];

        // If none then focus the first
        if (!focusItem) {
            focusItem = items[0];
        }

        if (focusItem) {

            var itemElement = element.querySelector('*[data-id=\'' + focusItem.Id + '\']');

            Emby.FocusManager.focus(itemElement);
        }
    }

    function renderChildren(view, item) {

        renderTrackList(view, item);
        renderEpisodes(view, item);
        renderPeopleItems(view, item);

        var section = view.querySelector('.childrenSection');

        if (item.Type != 'MusicArtist') {
            if (!item.ChildCount || enableTrackList(item)) {
                section.classList.add('hide');
                return;
            }
        }

        var headerText = section.querySelector('h2');
        var showTitle = false;

        if (item.Type == "Series") {
            headerText.innerHTML = Globalize.translate('Seasons');
            headerText.classList.remove('hide');

        } else if (item.Type == "MusicArtist") {
            headerText.innerHTML = Globalize.translate('Albums');
            headerText.classList.remove('hide');

        } else if (item.Type == "MusicAlbum") {
            headerText.classList.add('hide');

        } else if (item.Type == "BoxSet") {
            headerText.classList.add('hide');

        } else {
            section.classList.add('hide');
            return;
        }

        var promise = item.Type == 'MusicArtist' ?
            Emby.Models.items({
                IncludeItemTypes: 'MusicAlbum',
                Recursive: true,
                ArtistIds: item.Id
            }) :
            Emby.Models.children(item, {});

        promise.then(function (result) {

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoVertical',
                showTitle: showTitle,
                scalable: true
            });
        });
    }

    function renderPeople(view, item) {

        Emby.Models.itemPeople(item, {

            limit: 32,
            images: [
            {
                type: 'Primary',
                width: 250
            }]

        }).then(function (people) {

            var section = view.querySelector('.peopleSection');

            if (!people.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            require([Emby.PluginManager.mapPath('defaulttheme', 'cards/peoplecardbuilder.js')], function () {
                DefaultTheme.PeopleCardBuilder.buildPeopleCards(people, {
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'portraitCard itemPersonThumb',
                    coverImage: true,
                    width: (section.offsetWidth / 7)
                });
            });
        });
    }

    function renderScenes(view, item) {

        Emby.Models.chapters(item, {
            images: [
            {
                type: 'Primary',
                width: 440
            }]

        }).then(function (chapters) {

            var section = view.querySelector('.scenesSection');

            if (!chapters.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            require([Emby.PluginManager.mapPath('defaulttheme', 'cards/chaptercardbuilder.js')], function () {
                DefaultTheme.ChapterCardBuilder.buildChapterCards(chapters, {
                    parentContainer: section,
                    itemsContainer: section.querySelector('.itemsContainer'),
                    shape: 'backdropCard',
                    coverImage: true
                });
            });
        });
    }

    function renderSimilar(view, item) {

        Emby.Models.similar(item, {

            Limit: 12

        }).then(function (result) {

            var section = view.querySelector('.similarSection');

            if (!result.Items.length) {
                section.classList.add('hide');
                return;
            }

            section.classList.remove('hide');

            section.querySelector('h2').innerHTML = Globalize.translate('SimilarTo', item.Name);

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoVertical',
                scalable: true,
                coverImage: item.Type == 'MusicArtist' || item.Type == 'MusicAlbum'
            });
        });
    }

    function getDisplayTime(date) {

        if ((typeof date).toString().toLowerCase() === 'string') {
            try {

                date = Emby.DateTime.parseISO8601Date(date);

            } catch (err) {
                return date;
            }
        }

        var lower = date.toLocaleTimeString().toLowerCase();

        var hours = date.getHours();
        var minutes = date.getMinutes();

        var text;

        if (lower.indexOf('am') != -1 || lower.indexOf('pm') != -1) {

            var suffix = hours > 11 ? 'pm' : 'am';

            hours = (hours % 12) || 12;

            text = hours;

            if (minutes) {

                text += ':';
                if (minutes < 10) {
                    text += '0';
                }
                text += minutes;
            }

            text += suffix;

        } else {
            text = hours + ':';

            if (minutes < 10) {
                text += '0';
            }
            text += minutes;
        }

        return text;
    }

})();
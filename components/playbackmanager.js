define(['events', 'datetime', 'appsettings'], function (Events, datetime, appSettings) {

    function playbackManager() {

        var self = this;

        var lastBitrateDetect = 0;
        var currentPlayer;
        var repeatMode = 'RepeatNone';
        var playlist = [];
        var currentPlaylistIndex;
        var currentPlayOptions;
        var playNextAfterEnded = true;
        var playerStates = {};

        self.currentItem = function (player) {
            var data = getPlayerData(player);
            return data.streamInfo ? data.streamInfo.item : null;
        };

        self.currentMediaSource = function (player) {
            var data = getPlayerData(player);
            return data.streamInfo ? data.streamInfo.mediaSource : null;
        };

        function getCurrentSubtitleStream(player) {

            var index = getPlayerData(player).subtitleStreamIndex;

            if (index == null || index == -1) {
                return null;
            }

            return getSubtitleStream(player, index);
        };

        function getSubtitleStream(player, index) {
            return self.currentMediaSource(player).MediaStreams.filter(function (s) {
                return s.Type == 'Subtitle' && s.Index == index;
            })[0];
        };

        self.audioTracks = function (player) {
            var mediaSource = self.currentMediaSource(player);

            var mediaStreams = (mediaSource || {}).MediaStreams || [];
            return mediaStreams.filter(function (s) {
                return s.Type == 'Audio';
            });
        };

        self.subtitleTracks = function (player) {
            var mediaSource = self.currentMediaSource(player);

            var mediaStreams = (mediaSource || {}).MediaStreams || [];
            return mediaStreams.filter(function (s) {
                return s.Type == 'Subtitle';
            });
        };

        self.playlist = function () {
            return playlist.slice(0);
        };

        self.currentPlayer = function () {
            return currentPlayer;
        };

        self.isPlaying = function () {
            return currentPlayer != null && currentPlayer.currentSrc() != null;
        };

        self.isPlayingVideo = function () {
            if (self.isPlaying()) {
                var playerData = getPlayerData(currentPlayer);

                return playerData.streamInfo.mediaType == 'Video';
            }

            return false;
        };

        self.isPlayingAudio = function () {
            if (self.isPlaying()) {
                var playerData = getPlayerData(currentPlayer);

                return playerData.streamInfo.mediaType == 'Audio';
            }

            return false;
        };

        self.getPlayers = function () {

            var players = Emby.PluginManager.ofType('mediaplayer');

            players.sort(function (a, b) {

                return (a.priority || 0) - (b.priority || 0);
            });

            return players;
        };

        self.canPlay = function (item) {

            var itemType = item.Type;
            var locationType = item.LocationType;
            var mediaType = item.MediaType;

            if (itemType == "MusicGenre" || itemType == "Season" || itemType == "Series" || itemType == "BoxSet" || itemType == "MusicAlbum" || itemType == "MusicArtist" || itemType == "Playlist") {
                return true;
            }

            if (locationType == "Virtual") {
                if (itemType != "Program") {
                    return false;
                }
            }

            if (itemType == "Program") {
                if (new Date().getTime() > datetime.parseISO8601Date(item.EndDate).getTime() || new Date().getTime() < datetime.parseISO8601Date(item.StartDate).getTime()) {
                    return false;
                }
            }

            return self.getPlayers().filter(function (p) {

                return p.canPlayMediaType(mediaType);

            }).length;
        };

        self.canQueue = function (item) {

            if (item.Type == 'MusicAlbum' || item.Type == 'MusicArtist' || item.Type == 'MusicGenre') {
                return self.canQueueMediaType('Audio');
            }
            return self.canQueueMediaType(item.MediaType);
        };

        self.canQueueMediaType = function (mediaType) {

            if (currentPlayer) {
                return currentPlayer.canPlayMediaType(mediaType);
            }

            return false;
        };

        self.isMuted = function () {

            if (currentPlayer) {
                return currentPlayer.isMuted();
            }

            return false;
        };

        self.setMute = function (mute) {

            if (currentPlayer) {
                currentPlayer.setMute(mute);
            }
        };

        self.toggleMute = function (mute) {

            if (currentPlayer) {
                self.setMute(!self.isMuted());
            }
        };

        self.volume = function (val) {

            if (currentPlayer) {
                return currentPlayer.volume(val);
            }
        };

        self.volumeUp = function () {

            if (currentPlayer) {
                currentPlayer.volumeUp();
            }
        };

        self.volumeDown = function () {

            if (currentPlayer) {
                currentPlayer.volumeDown();
            }
        };

        self.setAudioStreamIndex = function (player, index) {

            var player = currentPlayer;

            if (getPlayerData(player).streamInfo.playMethod == 'Transcode' || !player.canSetAudioStreamIndex()) {

                changeStream(player, getCurrentTicks(player), { AudioStreamIndex: index });

            } else {
                player.setAudioStreamIndex(index);
            }
        };

        self.setSubtitleStreamIndex = function (index) {

            var player = currentPlayer;
            var currentStream = getCurrentSubtitleStream(player);

            var newStream = getSubtitleStream(player, index);

            if (!currentStream && !newStream) return;

            var selectedTrackElementIndex = -1;

            if (currentStream && !newStream) {

                if (currentStream.DeliveryMethod == 'Encode') {

                    // Need to change the transcoded stream to remove subs
                    changeStream(player, getCurrentTicks(player), { SubtitleStreamIndex: -1 });
                }
            }
            else if (!currentStream && newStream) {

                if (newStream.DeliveryMethod == 'External' || newStream.DeliveryMethod == 'Embed') {
                    selectedTrackElementIndex = index;
                } else {

                    // Need to change the transcoded stream to add subs
                    changeStream(player, getCurrentTicks(player), { SubtitleStreamIndex: index });
                }
            }
            else if (currentStream && newStream) {

                if (newStream.DeliveryMethod == 'External' || newStream.DeliveryMethod == 'Embed') {
                    selectedTrackElementIndex = index;

                    if (currentStream.DeliveryMethod != 'External' && currentStream.DeliveryMethod != 'Embed') {
                        changeStream(player, getCurrentTicks(player), { SubtitleStreamIndex: -1 });
                    }
                } else {

                    // Need to change the transcoded stream to add subs
                    changeStream(player, getCurrentTicks(player), { SubtitleStreamIndex: index });
                }
            }

            player.setSubtitleStreamIndex(selectedTrackElementIndex);

            getPlayerData(player).subtitleStreamIndex = index;
        };

        self.stop = function () {
            if (currentPlayer) {
                playNextAfterEnded = false;
                currentPlayer.stop(true, true);
            }
        };

        self.playPause = function () {
            if (currentPlayer) {

                if (currentPlayer.paused()) {
                    self.unpause();
                } else {
                    self.pause();
                }
            }
        };

        self.paused = function () {

            if (currentPlayer) {
                return currentPlayer.paused();
            }
        };

        self.pause = function () {
            if (currentPlayer) {
                currentPlayer.pause();
            }
        };

        self.unpause = function () {
            if (currentPlayer) {
                currentPlayer.unpause();
            }
        };

        self.seek = function (ticks) {

            var player = self.currentPlayer();

            changeStream(player, ticks);
        };

        self.fastForward = function () {

        };

        self.rewind = function () {

        };

        // Returns true if the player can seek using native client-side seeking functions
        function canPlayerSeek() {

            var mediaRenderer = self.currentPlayer();
            var currentSrc = mediaRenderer.currentSrc();

            if ((currentSrc || '').indexOf('.m3u8') != -1) {
                return true;
            } else {
                var duration = mediaRenderer.duration();
                return duration && !isNaN(duration) && duration != Number.POSITIVE_INFINITY && duration != Number.NEGATIVE_INFINITY;
            }
        }

        function changeStream(player, ticks, params) {

            if (canPlayerSeek() && params == null) {

                player.currentTime(ticks / 10000);
                return;
            }

            params = params || {};

            var currentSrc = player.currentSrc();

            var playSessionId = Emby.Page.param('PlaySessionId', currentSrc);
            var liveStreamId = Emby.Page.param('LiveStreamId', currentSrc);

            player.getDeviceProfile().then(function (deviceProfile) {

                var audioStreamIndex = params.AudioStreamIndex == null ? getPlayerData(player).subtitleStreamIndex : params.AudioStreamIndex;
                var subtitleStreamIndex = params.SubtitleStreamIndex == null ? getPlayerData(player).audioStreamIndex : params.SubtitleStreamIndex;

                require(['connectionManager'], function (connectionManager) {

                    var playerData = getPlayerData(player);
                    var currentItem = playerData.streamInfo.item;
                    var currentMediaSource = playerData.streamInfo.mediaSource;
                    var apiClient = connectionManager.getApiClient(currentItem.ServerId);

                    if (ticks) {
                        ticks = parseInt(ticks);
                    }

                    getPlaybackInfo(apiClient, currentItem.Id, deviceProfile, ticks, currentMediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId).then(function (result) {

                        if (validatePlaybackInfoResult(result)) {

                            currentMediaSource = result.MediaSources[0];
                            createStreamInfo(apiClient, currentItem.MediaType, currentItem, currentMediaSource, ticks).then(function (streamInfo) {

                                if (!streamInfo.url) {
                                    showPlaybackInfoErrorMessage('NoCompatibleStream');
                                    self.nextTrack();
                                    return;
                                }

                                getPlayerData(player).subtitleStreamIndex = subtitleStreamIndex;
                                getPlayerData(player).audioStreamIndex = audioStreamIndex;

                                changeStreamToUrl(apiClient, player, playSessionId, streamInfo);
                            });
                        }
                    });

                });
            });
        };

        function changeStreamToUrl(apiClient, mediaRenderer, playSessionId, streamInfo, newPositionTicks) {

            clearProgressInterval(mediaRenderer);

            getPlayerData(mediaRenderer).isChangingStream = true;

            if (getPlayerData(mediaRenderer).MediaType == "Video") {
                apiClient.stopActiveEncodings(playSessionId).then(function () {

                    setSrcIntoRenderer(apiClient, mediaRenderer, streamInfo);
                });

            } else {

                setSrcIntoRenderer(apiClient, mediaRenderer, streamInfo);
            }
        }

        function setSrcIntoRenderer(apiClient, mediaRenderer, streamInfo) {

            mediaRenderer.play(streamInfo);
            getPlayerData(mediaRenderer).streamInfo = streamInfo;

            //self.updateTextStreamUrls(newPositionTicks || 0);
        };

        self.seekPercent = function (percent, player) {

            var data = getPlayerData(player).streamInfo;
            var mediaSource = data.mediaSource;

            if (mediaSource) {
                var ticks = mediaSource.RunTimeTicks || 0;

                percent /= 100;
                ticks *= percent;
                self.seek(ticks);
            }
        };

        self.playTrailer = function (item) {

        };

        self.play = function (options) {

            validatePlayback(function () {
                if (typeof (options) === 'string') {
                    options = { ids: [options] };
                }

                playItems(options);
            });
        };

        self.shuffle = function (id) {

            Emby.Models.item(id).then(function (item) {

                var query = {
                    Fields: "MediaSources,Chapters",
                    Limit: 100,
                    Filters: "IsNotFolder",
                    Recursive: true,
                    SortBy: "Random"
                };

                if (item.Type == "MusicArtist") {

                    query.MediaTypes = "Audio";
                    query.ArtistIds = item.Id;

                }
                else if (item.Type == "MusicGenre") {

                    query.MediaTypes = "Audio";
                    query.Genres = item.Name;

                }
                else if (item.IsFolder) {
                    query.ParentId = id;

                }
                else {
                    return;
                }

                getItemsForPlayback(query).then(function (result) {

                    self.play({ items: result.Items });

                });

            });
        };

        self.instantMix = function (id) {

            Emby.Models.instantMix(id).then(function (result) {

                validatePlayback(function () {
                    playItems({
                        items: result.Items
                    });
                });
            });
        };

        function getPlayerData(player) {

            if (!player) {
                throw new Error('player cannot be null');
            }
            if (!player.name) {
                throw new Error('player name cannot be null');
            }
            var state = playerStates[player.name];

            if (!state) {
                playerStates[player.name] = {};
                state = playerStates[player.name];
            }

            return player;
        }

        self.getPlayerState = function (player) {
            return getPlayerStateInternal(player || currentPlayer);
        };

        function getPlayerStateInternal(player) {

            var playerData = getPlayerData(player);
            var item = playerData.streamInfo.item;
            var mediaSource = playerData.streamInfo.mediaSource;

            var state = {
                PlayState: {}
            };

            if (player) {

                state.PlayState.VolumeLevel = player.volume();
                state.PlayState.IsMuted = player.isMuted();
                state.PlayState.IsPaused = player.paused();
                state.PlayState.PositionTicks = getCurrentTicks(player);
                state.PlayState.RepeatMode = self.getRepeatMode();

                var currentSrc = player.currentSrc();

                if (currentSrc) {

                    state.PlayState.SubtitleStreamIndex = playerData.subtitleStreamIndex;
                    state.PlayState.AudioStreamIndex = playerData.audioStreamIndex;

                    state.PlayState.PlayMethod = playerData.streamInfo.playMethod;

                    state.PlayState.LiveStreamId = mediaSource.LiveStreamId;
                    state.PlayState.PlaySessionId = Emby.Page.param('PlaySessionId', currentSrc);
                }
            }

            if (mediaSource) {

                state.PlayState.MediaSourceId = mediaSource.Id;

                state.NowPlayingItem = {
                    RunTimeTicks: mediaSource.RunTimeTicks
                };

                state.PlayState.CanSeek = (mediaSource.RunTimeTicks || 0) > 0 || canPlayerSeek();
            }

            if (item) {

                state.NowPlayingItem = getNowPlayingItemForReporting(item, mediaSource);
            }

            return state;
        }

        self.currentTime = function (player) {
            return getCurrentTicks(player);
        };

        function getCurrentTicks(player) {

            var playerTime = Math.floor(10000 * (player || currentPlayer).currentTime());

            playerTime += getPlayerData(player).streamInfo.transcodingOffsetTicks;

            return playerTime;
        }

        function getNowPlayingItemForReporting(item, mediaSource) {

            var nowPlayingItem = {};

            nowPlayingItem.RunTimeTicks = mediaSource.RunTimeTicks;

            nowPlayingItem.Id = item.Id;
            nowPlayingItem.MediaType = item.MediaType;
            nowPlayingItem.Type = item.Type;
            nowPlayingItem.Name = item.Name;

            nowPlayingItem.IndexNumber = item.IndexNumber;
            nowPlayingItem.IndexNumberEnd = item.IndexNumberEnd;
            nowPlayingItem.ParentIndexNumber = item.ParentIndexNumber;
            nowPlayingItem.ProductionYear = item.ProductionYear;
            nowPlayingItem.PremiereDate = item.PremiereDate;
            nowPlayingItem.SeriesName = item.SeriesName;
            nowPlayingItem.Album = item.Album;
            nowPlayingItem.Artists = item.ArtistItems;

            var imageTags = item.ImageTags || {};

            if (item.SeriesPrimaryImageTag) {

                nowPlayingItem.PrimaryImageItemId = item.SeriesId;
                nowPlayingItem.PrimaryImageTag = item.SeriesPrimaryImageTag;
            }
            else if (imageTags.Primary) {

                nowPlayingItem.PrimaryImageItemId = item.Id;
                nowPlayingItem.PrimaryImageTag = imageTags.Primary;
            }
            else if (item.AlbumPrimaryImageTag) {

                nowPlayingItem.PrimaryImageItemId = item.AlbumId;
                nowPlayingItem.PrimaryImageTag = item.AlbumPrimaryImageTag;
            }
            else if (item.SeriesPrimaryImageTag) {

                nowPlayingItem.PrimaryImageItemId = item.SeriesId;
                nowPlayingItem.PrimaryImageTag = item.SeriesPrimaryImageTag;
            }

            if (item.BackdropImageTags && item.BackdropImageTags.length) {

                nowPlayingItem.BackdropItemId = item.Id;
                nowPlayingItem.BackdropImageTag = item.BackdropImageTags[0];
            }
            else if (item.ParentBackdropImageTags && item.ParentBackdropImageTags.length) {
                nowPlayingItem.BackdropItemId = item.ParentBackdropItemId;
                nowPlayingItem.BackdropImageTag = item.ParentBackdropImageTags[0];
            }

            if (imageTags.Thumb) {

                nowPlayingItem.ThumbItemId = item.Id;
                nowPlayingItem.ThumbImageTag = imageTags.Thumb;
            }

            if (imageTags.Logo) {

                nowPlayingItem.LogoItemId = item.Id;
                nowPlayingItem.LogoImageTag = imageTags.Logo;
            }
            else if (item.ParentLogoImageTag) {

                nowPlayingItem.LogoItemId = item.ParentLogoItemId;
                nowPlayingItem.LogoImageTag = item.ParentLogoImageTag;
            }

            return nowPlayingItem;
        }

        function validatePlayback(fn) {

            fn();

            //requirejs(["scripts/registrationservices"], function () {
            //    RegistrationServices.validateFeature('playback').then(fn);
            //});
        }

        function playItems(options, method) {

            if (options.fullscreen !== false) {
                require(['loading'], function (loading) {
                    loading.show();
                });
            }

            if (options.items) {

                translateItemsForPlayback(options.items).then(function (items) {

                    playWithIntros(items, options);
                });

            } else {

                getItemsForPlayback({

                    Ids: options.ids.join(',')

                }).then(function (result) {

                    translateItemsForPlayback(result.Items).then(function (items) {

                        playWithIntros(items, options);
                    });

                });
            }
        }

        function translateItemsForPlayback(items) {

            return new Promise(function (resolve, reject) {

                var firstItem = items[0];
                var promise;

                if (firstItem.Type == "Program") {

                    promise = getItemsForPlayback({
                        Ids: firstItem.ChannelId,
                    });
                }
                else if (firstItem.Type == "Playlist") {

                    promise = getItemsForPlayback({
                        ParentId: firstItem.Id,
                    });
                }
                else if (firstItem.Type == "MusicArtist") {

                    promise = getItemsForPlayback({
                        ArtistIds: firstItem.Id,
                        Filters: "IsNotFolder",
                        Recursive: true,
                        SortBy: "SortName",
                        MediaTypes: "Audio"
                    });

                }
                else if (firstItem.Type == "MusicGenre") {

                    promise = getItemsForPlayback({
                        Genres: firstItem.Name,
                        Filters: "IsNotFolder",
                        Recursive: true,
                        SortBy: "SortName",
                        MediaTypes: "Audio"
                    });
                }
                else if (firstItem.IsFolder) {

                    promise = getItemsForPlayback({
                        ParentId: firstItem.Id,
                        Filters: "IsNotFolder",
                        Recursive: true,
                        SortBy: "SortName",
                        MediaTypes: "Audio,Video"
                    });
                }

                if (promise) {
                    promise.then(function (result) {

                        resolve(result.Items);

                    }, reject);
                } else {
                    resolve(items);
                }
            });
        }

        function playWithIntros(items, options, user) {

            var firstItem = items[0];

            if (firstItem.MediaType === "Video") {

                //Dashboard.showModalLoadingMsg();
            }

            var afterPlayInternal = function () {
                setPlaylistState(0, items);
                require(['loading'], function (loading) {
                    loading.hide();
                });
            };

            if (options.startPositionTicks || firstItem.MediaType !== 'Video' || options.fullscreen === false || !appSettings.enableCinemaMode()) {

                currentPlayOptions = options;
                playInternal(firstItem, options.startPositionTicks, afterPlayInternal);
                return;
            }

            Emby.Models.intros(firstItem.Id).then(function (intros) {

                items = intros.Items.concat(items);
                currentPlayOptions = options;
                playInternal(items[0], options.startPositionTicks, afterPlayInternal);
            });
        }

        // Set currentPlaylistIndex and playlist. Using a method allows for overloading in derived player implementations
        function setPlaylistState(i, items) {
            if (!isNaN(i)) {
                currentPlaylistIndex = i;
            }
            if (items) {
                playlist = items.slice(0);
            }
        }

        function playInternal(item, startPosition, callback) {

            if (item.IsPlaceHolder) {
                require(['loading'], function (loading) {
                    loading.hide();
                    showPlaybackInfoErrorMessage('PlaceHolder');
                });
                return;
            }

            var depends = ['connectionManager'];

            require(depends, function (connectionManager) {

                var apiClient = connectionManager.getApiClient(item.ServerId);

                if (item.MediaType == 'Video' && appSettings.enableAutomaticBitrateDetection() && (new Date().getTime() - lastBitrateDetect) > 300000) {

                    apiClient.detectBitrate().then(function (bitrate) {

                        console.log('Max bitrate auto detected to ' + bitrate);
                        lastBitrateDetect = new Date().getTime();
                        appSettings.maxStreamingBitrate(bitrate);

                        playAfterBitrateDetect(apiClient, bitrate, item, startPosition, callback);

                    }, function () {

                        playAfterBitrateDetect(apiClient, appSettings.maxStreamingBitrate(), item, startPosition, callback);
                    });

                } else {
                    playAfterBitrateDetect(apiClient, appSettings.maxStreamingBitrate(), item, startPosition, callback);
                }
            });
        }

        function playAfterBitrateDetect(apiClient, maxBitrate, item, startPosition, callback) {

            var player = getPlayer(item);
            var activePlayer = currentPlayer;

            if (activePlayer) {

                // TODO: if changing players within the same playlist, this will cause nextItem to be null
                playNextAfterEnded = false;
                onPlaybackChanging(activePlayer, player, item);
            }

            player.getDeviceProfile().then(function (deviceProfile) {

                deviceProfile.MaxStreamingBitrate = Math.min(deviceProfile.MaxStreamingBitrate, maxBitrate);

                tryStartPlayback(apiClient, deviceProfile, item, startPosition, function (mediaSource) {

                    createStreamInfo(apiClient, item.MediaType, item, mediaSource, startPosition).then(function (streamInfo) {

                        streamInfo.fullscreen = currentPlayOptions.fullscreen;

                        getPlayerData(player).isChangingStream = false;

                        player.play(streamInfo).then(callback);
                        currentPlayer = player;
                        getPlayerData(player).streamInfo = streamInfo;
                        getPlayerData(player).audioStreamIndex = mediaSource.DefaultAudioStreamIndex;
                        getPlayerData(player).subtitleStreamIndex = mediaSource.DefaultSubtitleStreamIndex;
                    });
                });
            });
        }

        function createStreamInfo(apiClient, type, item, mediaSource, startPosition) {

            return new Promise(function (resolve, reject) {

                var mediaUrl;
                var contentType;
                var transcodingOffsetTicks = 0;
                var playerStartPositionTicks = startPosition;

                var playMethod = 'Transcode';

                if (type == 'Video') {

                    contentType = 'video/' + mediaSource.Container;

                    if (mediaSource.enableDirectPlay) {
                        mediaUrl = mediaSource.Path;

                        playMethod = 'DirectPlay';

                    } else {

                        if (mediaSource.SupportsDirectStream) {

                            var directOptions = {
                                Static: true,
                                mediaSourceId: mediaSource.Id,
                                deviceId: apiClient.deviceId(),
                                api_key: apiClient.accessToken()
                            };

                            if (mediaSource.LiveStreamId) {
                                directOptions.LiveStreamId = mediaSource.LiveStreamId;
                            }

                            mediaUrl = apiClient.getUrl('Videos/' + item.Id + '/stream.' + mediaSource.Container, directOptions);

                            playMethod = 'DirectStream';
                        } else if (mediaSource.SupportsTranscoding) {

                            mediaUrl = apiClient.getUrl(mediaSource.TranscodingUrl);

                            if (mediaSource.TranscodingSubProtocol == 'hls') {

                                contentType = 'application/x-mpegURL';
                            } else {

                                transcodingOffsetTicks = startPosition || 0;
                                playerStartPositionTicks = null;
                                contentType = 'video/' + mediaSource.TranscodingContainer;
                            }
                        }
                    }

                } else {

                    contentType = 'audio/' + mediaSource.Container;

                    if (mediaSource.enableDirectPlay) {

                        mediaUrl = mediaSource.Path;

                        playMethod = 'DirectPlay';

                    } else {

                        var isDirectStream = mediaSource.SupportsDirectStream;

                        if (isDirectStream) {

                            var outputContainer = (mediaSource.Container || '').toLowerCase();

                            var directOptions = {
                                Static: true,
                                mediaSourceId: mediaSource.Id,
                                deviceId: apiClient.deviceId(),
                                api_key: apiClient.accessToken()
                            };

                            if (mediaSource.LiveStreamId) {
                                directOptions.LiveStreamId = mediaSource.LiveStreamId;
                            }

                            mediaUrl = apiClient.getUrl('Audio/' + item.Id + '/stream.' + outputContainer, directOptions);

                            playMethod = 'DirectStream';

                        } else if (mediaSource.SupportsTranscoding) {

                            mediaUrl = apiClient.getUrl(mediaSource.TranscodingUrl);

                            if (mediaSource.TranscodingSubProtocol == 'hls') {

                                contentType = 'application/x-mpegURL';
                            } else {

                                transcodingOffsetTicks = startPosition || 0;
                                playerStartPositionTicks = null;
                                contentType = 'audio/' + mediaSource.TranscodingContainer;
                            }
                        }
                    }
                }

                var resultInfo = {
                    url: mediaUrl,
                    mimeType: contentType,
                    transcodingOffsetTicks: transcodingOffsetTicks,
                    playMethod: playMethod,
                    playerStartPositionTicks: playerStartPositionTicks,
                    item: item,
                    mediaSource: mediaSource,
                    textTracks: getTextTracks(apiClient, mediaSource),
                    mediaType: type
                };

                resolve(resultInfo);
            });
        }

        function getTextTracks(apiClient, mediaSource) {

            var subtitleStreams = mediaSource.MediaStreams.filter(function (s) {
                return s.Type == 'Subtitle';
            });

            var textStreams = subtitleStreams.filter(function (s) {
                return s.DeliveryMethod == 'External';
            });

            var tracks = [];

            for (var i = 0, length = textStreams.length; i < length; i++) {

                var textStream = textStreams[i];
                var textStreamUrl = !textStream.IsExternalUrl ? apiClient.getUrl(textStream.DeliveryUrl) : textStream.DeliveryUrl;

                tracks.push({
                    url: textStreamUrl,
                    language: (textStream.Language || 'und'),
                    isDefault: textStream.Index == mediaSource.DefaultSubtitleStreamIndex,
                    index: textStream.Index
                });
            }

            return tracks;
        }

        function tryStartPlayback(apiClient, deviceProfile, item, startPosition, callback) {

            if (item.MediaType === "Video") {

                //Dashboard.showModalLoadingMsg();
            }

            getPlaybackInfo(apiClient, item.Id, deviceProfile, startPosition).then(function (playbackInfoResult) {

                if (validatePlaybackInfoResult(playbackInfoResult)) {

                    getOptimalMediaSource(apiClient, item.MediaType, playbackInfoResult.MediaSources).then(function (mediaSource) {
                        if (mediaSource) {

                            if (mediaSource.RequiresOpening) {

                                getLiveStream(apiClient, item.Id, playbackInfoResult.PlaySessionId, deviceProfile, startPosition, mediaSource, null, null).then(function (openLiveStreamResult) {

                                    supportsDirectPlay(apiClient, openLiveStreamResult.MediaSource).then(function (result) {

                                        openLiveStreamResult.MediaSource.enableDirectPlay = result;
                                        callback(openLiveStreamResult.MediaSource);
                                    });

                                });

                            } else {
                                callback(mediaSource);
                            }
                        } else {
                            //Dashboard.hideModalLoadingMsg();
                            showPlaybackInfoErrorMessage('NoCompatibleStream');
                        }
                    });
                }
            });
        }

        function getPlaybackInfo(apiClient, itemId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId) {

            var postData = {
                DeviceProfile: deviceProfile
            };

            var query = {
                UserId: apiClient.getCurrentUserId(),
                StartTimeTicks: startPosition || 0
            };

            if (audioStreamIndex != null) {
                query.AudioStreamIndex = audioStreamIndex;
            }
            if (subtitleStreamIndex != null) {
                query.SubtitleStreamIndex = subtitleStreamIndex;
            }
            if (mediaSource) {
                query.MediaSourceId = mediaSource.Id;
            }
            if (liveStreamId) {
                query.LiveStreamId = liveStreamId;
            }

            return apiClient.ajax({
                url: apiClient.getUrl('Items/' + itemId + '/PlaybackInfo', query),
                type: 'POST',
                data: JSON.stringify(postData),
                contentType: "application/json",
                dataType: "json"

            });
        }

        function getOptimalMediaSource(apiClient, mediaType, versions) {

            return new Promise(function (resolve, reject) {

                var promises = versions.map(function (v) {
                    return supportsDirectPlay(apiClient, v);
                });

                Promise.all(promises).then(function (results) {

                    for (var i = 0, length = versions.length; i < length; i++) {
                        versions[i].enableDirectPlay = results[i] || false;
                    }
                    var optimalVersion = versions.filter(function (v) {

                        return v.enableDirectPlay;

                    })[0];

                    if (!optimalVersion) {
                        optimalVersion = versions.filter(function (v) {

                            return v.SupportsDirectStream;

                        })[0];
                    }

                    optimalVersion = optimalVersion || versions.filter(function (s) {
                        return s.SupportsTranscoding;
                    })[0];

                    resolve(optimalVersion);

                }, reject);
            });
        }

        function getLiveStream(apiClient, itemId, playSessionId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex) {

            return new Promise(function (resolve, reject) {

                var postData = {
                    DeviceProfile: deviceProfile,
                    OpenToken: mediaSource.OpenToken
                };

                var query = {
                    UserId: apiClient.getCurrentUserId(),
                    StartTimeTicks: startPosition || 0,
                    ItemId: itemId,
                    PlaySessionId: playSessionId
                };

                if (audioStreamIndex != null) {
                    query.AudioStreamIndex = audioStreamIndex;
                }
                if (subtitleStreamIndex != null) {
                    query.SubtitleStreamIndex = subtitleStreamIndex;
                }

                apiClient.ajax({
                    url: apiClient.getUrl('LiveStreams/Open', query),
                    type: 'POST',
                    data: JSON.stringify(postData),
                    contentType: "application/json",
                    dataType: "json"

                }).then(resolve, reject);
            });
        };

        function supportsDirectPlay(apiClient, mediaSource) {

            return new Promise(function (resolve, reject) {

                if (mediaSource.SupportsDirectPlay) {

                    if (mediaSource.Protocol == 'Http' && !mediaSource.RequiredHttpHeaders.length) {

                        // If this is the only way it can be played, then allow it
                        if (!mediaSource.SupportsDirectStream && !mediaSource.SupportsTranscoding) {
                            resolve(true);
                        }
                        else {
                            var val = mediaSource.Path.toLowerCase().replace('https:', 'http').indexOf(apiClient.serverAddress().toLowerCase().replace('https:', 'http').substring(0, 14)) == 0;
                            resolve(val);
                        }
                    }

                    if (mediaSource.Protocol == 'File') {

                        // Determine if the file can be accessed directly
                        require(['filesystem'], function (filesystem) {

                            filesystem.fileExists(mediaSource.Path).then(function () {
                                resolve(true);
                            }, function () {
                                resolve(false);
                            });

                        });
                    }
                }
                else {
                    resolve(false);
                }
            });
        };

        function validatePlaybackInfoResult(result) {

            if (result.ErrorCode) {

                showPlaybackInfoErrorMessage(result.ErrorCode);
                return false;
            }

            return true;
        }

        function showPlaybackInfoErrorMessage(errorCode) {

            Dashboard.alert({
                text: Globalize.translate('core#MessagePlaybackError' + errorCode),
                title: Globalize.translate('core#HeaderPlaybackError')
            });

        }

        function getPlayer(item) {

            return self.getPlayers().filter(function (p) {

                return p.canPlayMediaType(item.MediaType);

            })[0];
        }

        function getItemsForPlayback(query) {

            return new Promise(function (resolve, reject) {

                if (query.Ids && query.Ids.split(',').length == 1) {

                    Emby.Models.item(query.Ids.split(',')).then(function (item) {

                        resolve({
                            Items: [item],
                            TotalRecordCount: 1
                        });

                    }, reject);
                }
                else {

                    query.Limit = query.Limit || 100;
                    query.Fields = "MediaSources,Chapters";
                    query.ExcludeLocationTypes = "Virtual";

                    Emby.Models.items(query).then(resolve, reject);
                }
            });
        };

        // Gets or sets the current playlist index
        self.currentPlaylistIndex = function (i) {

            if (i == null) {
                return currentPlaylistIndex;
            }

            var newItem = playlist[i];

            playInternal(newItem, 0, function () {
                self.setPlaylistState(i);
            });
        };

        self.setRepeatMode = function (value) {
            repeatMode = value;
            Events.trigger(self, 'repeatmodechange');
        };

        self.getRepeatMode = function () {
            return repeatMode;
        };

        function getNextItemInfo() {

            var newIndex;
            var playlistLength = playlist.length;

            switch (self.getRepeatMode()) {

                case 'RepeatOne':
                    newIndex = currentPlaylistIndex;
                    break;
                case 'RepeatAll':
                    newIndex = currentPlaylistIndex + 1;
                    if (newIndex >= playlistLength) {
                        newIndex = 0;
                    }
                    break;
                default:
                    newIndex = currentPlaylistIndex + 1;
                    break;
            }

            if (newIndex < 0 || newIndex >= playlistLength) {
                return null;
            }

            var item = playlist[newIndex];

            if (!item) {
                return null;
            }

            return {
                item: item,
                index: newIndex
            };
        }

        self.nextTrack = function () {

            var newItemInfo = getNextItemInfo();

            if (newItemInfo) {

                console.log('playing next track');

                playInternal(newItemInfo.item, 0, function () {
                    setPlaylistState(newItemInfo.index);
                });
            }
        };

        self.previousTrack = function () {
            var newIndex = currentPlaylistIndex - 1;
            if (newIndex >= 0) {
                var newItem = playlist[newIndex];

                if (newItem) {
                    playInternal(newItem, 0, function () {
                        setPlaylistState(newIndex);
                    });
                }
            }
        };

        self.queue = function (options) {
            queue(options);
        };

        self.queueNext = function (options) {
            queue(options, 'next');
        };

        function queue(options, mode) {

            if (!currentPlayer) {
                self.play(options);
                return;
            }

            if (typeof (options) === 'string') {
                options = { ids: [options] };
            }

            // TODO
        }

        function onPlaybackStarted() {

            var player = this;

            if (getPlayerData(player).isChangingStream) {

                getPlayerData(player).isChangingStream = false;

                startProgressInterval(player);
                sendProgressUpdate(player);
                return;
            }

            playNextAfterEnded = true;

            var state = getPlayerStateInternal(player);

            reportPlayback(state, getPlayerData(player).streamInfo.item.ServerId, 'reportPlaybackStart');

            startProgressInterval(player);

            Events.trigger(self, 'playbackstart', [player]);
        }

        function onPlaybackStopped(e) {

            var player = this;

            if (getPlayerData(player).isChangingStream) {
                return;
            }

            // User clicked stop or content ended
            var state = getPlayerStateInternal(player);

            reportPlayback(state, getPlayerData(player).streamInfo.item.ServerId, 'reportPlaybackStopped');

            clearProgressInterval(player);

            var nextItem = playNextAfterEnded ? getNextItemInfo() : null;

            Events.trigger(self, 'playbackstop', [{
                player: player,
                state: state,
                nextItem: (nextItem ? nextItem.item : null),
                nextMediaType: (nextItem ? nextItem.item.MediaType : null)
            }]);

            var newPlayer = nextItem ? getPlayer(nextItem.item) : null;

            if (newPlayer != player) {
                player.destroy();
            }

            if (player == currentPlayer) {
                currentPlayer = null;
            }

            if (nextItem) {
                self.nextTrack();
            }
        }

        function onPlaybackChanging(activePlayer, newPlayer, newItem) {

            var state = getPlayerStateInternal(activePlayer);
            var serverId = getPlayerData(activePlayer).streamInfo.item.ServerId;

            // User started playing something new while existing content is playing

            if (activePlayer == newPlayer) {

                // If we're staying with the same player, stop it
                activePlayer.stop(false, false);

            } else {

                // If we're switching players, tear down the current one
                activePlayer.stop(true, false);
            }

            reportPlayback(state, serverId, 'reportPlaybackStopped');

            clearProgressInterval(activePlayer);

            Events.trigger(self, 'playbackstop', [{
                player: activePlayer,
                state: state,
                nextItem: newItem,
                nextMediaType: newItem.MediaType
            }]);
        }

        Events.on(Emby.PluginManager, 'registered', function (e, plugin) {

            if (plugin.type == 'mediaplayer') {

                plugin.currentState = {};

                Events.on(plugin, 'started', onPlaybackStarted);
                Events.on(plugin, 'stopped', onPlaybackStopped);
            }
        });

        function startProgressInterval(player) {

            clearProgressInterval(player);

            var intervalTime = 800;
            player.lastProgressReport = 0;

            getPlayerData(player).currentProgressInterval = setInterval(function () {

                if ((new Date().getTime() - player.lastProgressReport) > intervalTime) {

                    sendProgressUpdate(player);
                }

            }, 250);
        }

        function sendProgressUpdate(player) {

            player.lastProgressReport = new Date().getTime();

            var state = getPlayerStateInternal(player);
            var currentItem = getPlayerData(player).streamInfo.item;
            reportPlayback(state, currentItem.ServerId, 'reportPlaybackProgress');
        }

        function reportPlayback(state, serverId, method) {

            var info = {
                QueueableMediaTypes: state.NowPlayingItem.MediaType,
                ItemId: state.NowPlayingItem.Id
            };

            for (var i in state.PlayState) {
                info[i] = state.PlayState[i];
            }
            //console.log(method + '-' + JSON.stringify(info));
            require(['connectionManager'], function (connectionManager) {
                var apiClient = connectionManager.getApiClient(serverId);
                apiClient[method](info);
            });
        }

        function clearProgressInterval(player) {

            if (getPlayerData(player).currentProgressInterval) {
                clearTimeout(getPlayerData(player).currentProgressInterval);
                getPlayerData(player).currentProgressInterval = null;
            }
        }

        window.addEventListener("beforeunload", function (e) {

            var player = currentPlayer;

            // Try to report playback stopped before the browser closes
            if (player && getPlayerData(player).currentProgressInterval) {
                onPlaybackStopped.call(player);
                self.stop();

                event.returnValue = "Stopping current track...";
            }
        });
    }

    return new playbackManager();
});
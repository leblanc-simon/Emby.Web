(function (globalScope) {

    function playbackManager() {

        var self = this;

        var lastBitrateDetect = 0;
        var currentPlayer;
        var repeatMode = 'RepeatNone';
        var playlist = [];
        var currentPlaylistIndex;
        var playNextAfterEnded = true;
        var playerStates = {};

        self.currentItem = function (player) {
            var data = getPlayerState(player);
            return data.streamInfo ? data.streamInfo.item : null;
        };

        self.playlist = function () {
            return playlist;
        };

        self.currentPlayer = function () {
            return currentPlayer;
        };

        self.isPlaying = function () {
            return currentPlayer != null && currentPlayer.currentSrc() != null;
        };

        self.isPlayingVideo = function () {
            return false;
        };

        self.getPlayers = function () {

            return Emby.PluginManager.ofType('mediaplayer');
        };

        self.canPlay = function (item) {

            var itemType = item.Type;
            var locationType = item.LocationType;
            var mediaType = item.MediaType;

            if (itemType == "Program") {
                return false;
            }

            if (itemType == "MusicGenre" || itemType == "Season" || itemType == "Series" || itemType == "BoxSet" || itemType == "MusicAlbum" || itemType == "MusicArtist" || itemType == "Playlist") {
                return true;
            }

            if (locationType == "Virtual") {
                return false;
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

        self.setAudioStreamIndex = function (index) {

            if (currentPlayer) {
                currentPlayer.setAudioStreamIndex(index);
            }
        };

        self.setSubtitleStreamIndex = function (index) {

            if (currentPlayer) {
                currentPlayer.setSubtitleStreamIndex(index);
            }
        };

        self.stop = function () {
            if (currentPlayer) {
                playNextAfterEnded = false;
                currentPlayer.stop(true);
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

        self.nextTrack = function () {
        };

        self.previousTrack = function () {
        };

        self.seek = function (ticks) {
            changeStream(ticks);
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

        function changeStream(ticks, params) {

            var mediaRenderer = self.currentPlayer();

            if (canPlayerSeek() && params == null) {

                mediaRenderer.currentTime(ticks / 10000);
                return;
            }

            params = params || {};

            var currentSrc = mediaRenderer.currentSrc();

            var playSessionId = Emby.Page.param('PlaySessionId', currentSrc);
            var liveStreamId = Emby.Page.param('LiveStreamId', currentSrc);

            var deviceProfile = mediaRenderer.getDeviceProfile();

            var audioStreamIndex = params.AudioStreamIndex == null ? (Emby.Page.param('AudioStreamIndex', currentSrc) || null) : params.AudioStreamIndex;
            if (typeof (audioStreamIndex) == 'string') {
                audioStreamIndex = parseInt(audioStreamIndex);
            }

            var subtitleStreamIndex = params.SubtitleStreamIndex == null ? (Emby.Page.param('SubtitleStreamIndex', currentSrc) || null) : params.SubtitleStreamIndex;
            if (typeof (subtitleStreamIndex) == 'string') {
                subtitleStreamIndex = parseInt(subtitleStreamIndex);
            }

            require(['connectionManager'], function (connectionManager) {

                var playerData = getPlayerState(mediaRenderer);
                var currentItem = playerData.streamInfo.item;
                var currentMediaSource = playerData.streamInfo.mediaSource;
                var apiClient = connectionManager.getApiClient(currentItem.ServerId);

                getPlaybackInfo(apiClient, currentItem.Id, deviceProfile, ticks, currentMediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId).then(function (result) {

                    if (validatePlaybackInfoResult(result)) {

                        currentMediaSource = result.MediaSources[0];
                        createStreamInfo(apiClient, currentItem.MediaType, currentItem, currentMediaSource, ticks).then(function (streamInfo) {

                            if (!streamInfo.url) {
                                showPlaybackInfoErrorMessage('NoCompatibleStream');
                                self.nextTrack();
                                return;
                            }

                            getPlayerState(mediaRenderer).currentSubtitleStreamIndex = subtitleStreamIndex;

                            changeStreamToUrl(apiClient, mediaRenderer, playSessionId, streamInfo);
                        });
                    }
                });

            });
        };

        function changeStreamToUrl(apiClient, mediaRenderer, playSessionId, streamInfo, newPositionTicks) {

            clearProgressInterval(mediaRenderer);

            getPlayerState(mediaRenderer).isChangingStream = true;

            if (getPlayerState(mediaRenderer).MediaType == "Video") {
                apiClient.stopActiveEncodings(playSessionId).done(function () {

                    setSrcIntoRenderer(apiClient, mediaRenderer, streamInfo);

                });

                self.updateTextStreamUrls(newPositionTicks || 0);
            } else {

                setSrcIntoRenderer(apiClient, mediaRenderer, streamInfo);
            }
        }

        function setSrcIntoRenderer(apiClient, mediaRenderer, streamInfo) {

            var mediaSource = streamInfo.mediaSource;

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
                    isDefault: textStream.Index == mediaSource.DefaultSubtitleStreamIndex
                });
            }

            mediaRenderer.play(streamInfo);

            getPlayerState(mediaRenderer).streamInfo = streamInfo;
        };

        self.seekPercent = function (percent, player) {

            var data = getPlayerState(player).streamInfo;
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

        function getPlayerState(player) {
            var state = playerStates[player.name];

            if (!state) {
                playerStates[player.name] = {};
                state = playerStates[player.name];
            }

            return player;
        }

        self.getPlayerState = function () {
            return getPlayerStateInternal(currentPlayer);
        };

        function getPlayerStateInternal(mediaRenderer) {

            var playerData = getPlayerState(mediaRenderer);
            var item = playerData.streamInfo.item;
            var mediaSource = playerData.streamInfo.mediaSource;

            var state = {
                PlayState: {}
            };

            if (mediaRenderer) {

                state.PlayState.VolumeLevel = mediaRenderer.volume();
                state.PlayState.IsMuted = mediaRenderer.isMuted();
                state.PlayState.IsPaused = mediaRenderer.paused();
                state.PlayState.PositionTicks = getCurrentTicks(mediaRenderer);
                state.PlayState.RepeatMode = self.getRepeatMode();

                var currentSrc = mediaRenderer.currentSrc();

                if (currentSrc) {

                    var audioStreamIndex = Emby.Page.param('AudioStreamIndex', currentSrc);

                    if (audioStreamIndex) {
                        state.PlayState.AudioStreamIndex = parseInt(audioStreamIndex);
                    }

                    state.PlayState.SubtitleStreamIndex = playerData.currentSubtitleStreamIndex;

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

            playerTime += getPlayerState(player).streamInfo.transcodingOffsetTicks;

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
            //    RegistrationServices.validateFeature('playback').done(fn);
            //});
        }

        function playItems(options, method) {

            require(['loading'], function (loading) {
                loading.show();
            });

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

                if (firstItem.Type == "Playlist") {

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

            if (options.startPositionTicks || firstItem.MediaType !== 'Video') {

                playInternal(firstItem, options.startPositionTicks, afterPlayInternal);
                return;
            }

            Emby.Models.intros(firstItem.Id).then(function (intros) {

                items = intros.Items.concat(items);
                playInternal(items[0], options.startPositionTicks, afterPlayInternal);
            });
        }

        // Set currentPlaylistIndex and playlist. Using a method allows for overloading in derived player implementations
        function setPlaylistState(i, items) {
            if (!isNaN(i)) {
                currentPlaylistIndex = i;
            }
            if (items) {
                playlist = items;
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

            require(['appsettings', 'connectionManager'], function (appSettings, connectionManager) {

                var apiClient = connectionManager.getApiClient(item.ServerId);

                if (item.MediaType == 'Video' && appSettings.enableAutomaticBitrateDetection() && (new Date().getTime() - lastBitrateDetect) > 300000) {

                    apiClient.detectBitrate().done(function (bitrate) {

                        Logger.log('Max bitrate auto detected to ' + bitrate);
                        lastBitrateDetect = new Date().getTime();
                        appSettings.maxStreamingBitrate(bitrate);

                        playAfterBitrateDetect(apiClient, item, startPosition, callback);

                    }).fail(function () {

                        playAfterBitrateDetect(apiClient, item, startPosition, callback);
                    });

                } else {
                    playAfterBitrateDetect(apiClient, item, startPosition, callback);
                }
            });
        }

        function playAfterBitrateDetect(apiClient, item, startPosition, callback) {

            var player = getPlayer(item);

            if (currentPlayer) {
                playNextAfterEnded = false;
                currentPlayer.stop(false);
            }

            var deviceProfile = player.getDeviceProfile();

            tryStartPlayback(apiClient, deviceProfile, item, startPosition, function (mediaSource) {

                createStreamInfo(apiClient, item.MediaType, item, mediaSource, startPosition).then(function (streamInfo) {

                    streamInfo.item = item;
                    streamInfo.mediaSource = mediaSource;
                    streamInfo.fullscreen = true;

                    getPlayerState(player).isChangingStream = false;

                    player.play(streamInfo).then(callback);
                    currentPlayer = player;
                    getPlayerState(player).streamInfo = streamInfo;
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
                    textTracks: getTextTracks(apiClient, mediaSource)
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
                    isDefault: textStream.Index == mediaSource.DefaultSubtitleStreamIndex
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

            return new Promise(function (resolve, reject) {

                getPlaybackInfoInternal(apiClient, itemId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId).then(resolve, reject);
            });
        }

        function getPlaybackInfoInternal(apiClient, itemId, deviceProfile, startPosition, mediaSource, audioStreamIndex, subtitleStreamIndex, liveStreamId) {

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

                        // TODO
                        resolve(false);
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
                text: Globalize.translate('MessagePlaybackError' + errorCode),
                title: Globalize.translate('HeaderPlaybackError')
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

        self.nextTrack = function () {

            var newIndex;

            switch (self.getRepeatMode()) {

                case 'RepeatOne':
                    newIndex = currentPlaylistIndex;
                    break;
                case 'RepeatAll':
                    newIndex = currentPlaylistIndex + 1;
                    if (newIndex >= playlist.length) {
                        newIndex = 0;
                    }
                    break;
                default:
                    newIndex = currentPlaylistIndex + 1;
                    break;
            }

            var newItem = playlist[newIndex];

            if (newItem) {

                Logger.log('playing next track');

                playInternal(newItem, 0, function () {
                    setPlaylistState(newIndex);
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

            if (getPlayerState(player).isChangingStream) {

                getPlayerState(player).isChangingStream = false;

                startProgressInterval(player);
                sendProgressUpdate(player);
                return;
            }

            playNextAfterEnded = true;

            var state = getPlayerStateInternal(player);

            reportPlayback(state, getPlayerState(player).streamInfo.item.ServerId, 'reportPlaybackStart');

            startProgressInterval(player);

            Events.trigger(self, 'playbackstart', [player]);
        }

        function onPlaybackStopped() {

            var player = this;

            if (getPlayerState(player).isChangingStream) {
                return;
            }

            var state = getPlayerStateInternal(player);
            reportPlayback(state, getPlayerState(player).streamInfo.item.ServerId, 'reportPlaybackStopped');

            clearProgressInterval(player);

            Events.trigger(self, 'playbackstop', [player]);

            if (playNextAfterEnded) {
                self.nextTrack();
            }
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

            var intervalTime = 1200;
            player.lastProgressReport = 0;

            getPlayerState(player).currentProgressInterval = setInterval(function () {

                if ((new Date().getTime() - player.lastProgressReport) > intervalTime) {

                    sendProgressUpdate(player);
                }

            }, 250);
        }

        function sendProgressUpdate(player) {

            player.lastProgressReport = new Date().getTime();

            var state = getPlayerStateInternal(player);
            var currentItem = getPlayerState(player).streamInfo.item;
            reportPlayback(state, currentItem.ServerId, 'reportPlaybackProgress');
        }

        function reportPlayback(state, serverId, method) {

            var info = {
                QueueableMediaTypes: state.NowPlayingItem.MediaType,
                ItemId: state.NowPlayingItem.Id,
                NowPlayingItem: state.NowPlayingItem
            };

            for (var i in state.PlayState) {
                info[i] = state.PlayState[i];
            }

            require(['connectionManager'], function (connectionManager) {
                var apiClient = connectionManager.getApiClient(serverId);
                apiClient[method](info);
            });
        }

        function clearProgressInterval(player) {

            if (getPlayerState(player).currentProgressInterval) {
                clearTimeout(getPlayerState(player).currentProgressInterval);
                getPlayerState(player).currentProgressInterval = null;
            }
        }

        window.addEventListener("beforeunload", function () {

            var player = currentPlayer;

            // Try to report playback stopped before the browser closes
            if (player && getPlayerState(player).currentProgressInterval) {

                onPlaybackStopped.call(player);
            }
        });
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.PlaybackManager = new playbackManager();

})(this);

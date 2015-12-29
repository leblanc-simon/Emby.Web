define(['actionsheet', 'datetime'], function (actionsheet, datetime) {

    function show(item) {

        var itemType = item.Type;
        var mediaType = item.MediaType;
        var isFolder = item.IsFolder;
        var itemId = item.Id;
        var resumePositionTicks = item.UserData ? item.UserData.PlaybackPositionTicks : null;

        if (!resumePositionTicks && mediaType != "Audio" && !isFolder) {
            Emby.PlaybackManager.play({
                items: [item]
            });
            return;
        }

        var menuItems = [];

        if (resumePositionTicks) {
            menuItems.push({
                name: Globalize.translate('core#ButtonResumeAt', datetime.getDisplayRunningTime(resumePositionTicks)),
                id: 'resume',
                ironIcon: 'play-arrow'
            });
        }

        menuItems.push({
            name: Globalize.translate('core#ButtonPlay'),
            id: 'play',
            ironIcon: 'play-arrow'
        });

        if (Emby.PlaybackManager.canQueueMediaType(mediaType)) {
            menuItems.push({
                name: Globalize.translate('core#ButtonQueue'),
                id: 'queue',
                ironIcon: 'playlist-add'
            });
        }

        if (itemType == "Audio" || itemType == "MusicAlbum" || itemType == "MusicArtist" || itemType == "MusicGenre") {
            menuItems.push({
                name: Globalize.translate('core#ButtonInstantMix'),
                id: 'instantmix',
                ironIcon: 'shuffle'
            });
        }

        if (isFolder || itemType == "MusicArtist" || itemType == "MusicGenre") {
            menuItems.push({
                name: Globalize.translate('core#ButtonShuffle'),
                id: 'shuffle',
                ironIcon: 'shuffle'
            });
        }

        actionsheet.show({
            items: menuItems,
            callback: function (id) {

                switch (id) {

                    case 'play':
                        Emby.PlaybackManager.play(itemId);
                        break;
                    case 'resume':
                        Emby.PlaybackManager.play({
                            ids: [itemId],
                            startPositionTicks: resumePositionTicks
                        });
                        break;
                    case 'queue':
                        Emby.PlaybackManager.queue(itemId);
                        break;
                    case 'instantmix':
                        Emby.PlaybackManager.instantMix(itemId);
                        break;
                    case 'shuffle':
                        Emby.PlaybackManager.shuffle(itemId);
                        break;
                    default:
                        break;
                }
            }
        });
    }

    return {
        show: show
    };
});
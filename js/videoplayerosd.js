define([], function () {

    var currentOsd;
    var currentPlayer;

    function setCurrentItem(item) {

        if (item) {
            DefaultTheme.Backdrop.setBackdrops([item]);

            DefaultTheme.CardBuilder.buildCards([item], {
                shape: 'squareCard',
                width: 640,
                itemsContainer: view.querySelector('.nowPlayingCardContainer'),
                scalable: true
            });

            var names = [];

            names.push(item.Name);

            if (item.ArtistItems && item.ArtistItems[0]) {
                names.push(item.ArtistItems[0].Name);
            }

            if (item.Album) {
                names.push(item.Album);
            }

            view.querySelector('.nowPlayingMetadata').innerHTML = names.join('<br/>');
            view.querySelector('.userDataIcons').innerHTML = DefaultTheme.UserData.getIconsHtml(item, false, 'xlargePaperIconButton');

            nowPlayingVolumeSlider.disabled = false;
            nowPlayingPositionSlider.disabled = false;

        } else {

            view.querySelector('.nowPlayingCardContainer').innerHTML = '';
            view.querySelector('.nowPlayingMetadata').innerHTML = '&nbsp;<br/>&nbsp;';
            view.querySelector('.userDataIcons').innerHTML = '';

            nowPlayingVolumeSlider.disabled = true;
            nowPlayingPositionSlider.disabled = true;

            DefaultTheme.Backdrop.setBackdrops([]);
        }
    }

    function onPlaybackStart(e, player) {

        bindToPlayer(player);
        setCurrentItem(Emby.PlaybackManager.currentItem(player));
    }

    function onPlaybackStop(e, player) {
        releasePlayer();
        setCurrentItem(null);
    }

    function bindToPlayer(player) {

        if (player != currentPlayer) {

            releasePlayer();

            Events.on(player, 'volumechange', onVolumeChange);
            Events.on(player, 'timeupdate', onTimeUpdate);
            Events.on(player, 'pause', onPlaystateChange);
            Events.on(player, 'playing', onPlaystateChange);
        }

        currentPlayer = player;
        updateVolume(player);
        updateTime(player);
        updatePlaystate(player);
    }

    function releasePlayer() {

        var player = currentPlayer;

        if (player) {
            Events.off(player, 'volumechange', onVolumeChange);
            Events.off(player, 'timeupdate', onTimeUpdate);
            Events.off(player, 'pause', onPlaystateChange);
            Events.off(player, 'playing', onPlaystateChange);
            currentPlayer = null;
        }
    }

    function onTimeUpdate(e) {
        updateTime(this);
    }

    function onVolumeChange(e) {
        updateVolume(this);
    }

    function onPlaystateChange(e) {
        updatePlaystate(this);
    }

    function updatePlaystate(player) {

        var osd = currentOsd;

        if (!osd) {
            return;
        }

        osd.setPaused(Emby.PlaybackManager.paused());
        osd.setRepeatMode(Emby.PlaybackManager.getRepeatMode());
    }

    function onRepeatModeChanged() {
        updatePlaystate(currentPlayer);
    }

    function updateVolume(player) {

        var osd = currentOsd;

        if (!osd) {
            return;
        }

        osd.setVolume(Emby.PlaybackManager.volume());
        osd.setMuted(Emby.PlaybackManager.isMuted());
    }

    function updateTime(player) {

        if (!nowPlayingPositionSlider.dragging) {

            var state = Emby.PlaybackManager.getPlayerState();
            var playState = state.PlayState || {};
            var nowPlayingItem = state.NowPlayingItem || {};

            if (nowPlayingItem.RunTimeTicks) {

                var pct = playState.PositionTicks / nowPlayingItem.RunTimeTicks;
                pct *= 100;

                nowPlayingPositionSlider.value = pct;

            } else {

                nowPlayingPositionSlider.value = 0;
            }

            nowPlayingPositionSlider.disabled = !playState.CanSeek;
        }
    }

    Events.on(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
    Events.on(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
    Events.on(Emby.PlaybackManager, 'repeatmodechange', onRepeatModeChanged);

    onPlaybackStart(e, Emby.PlaybackManager.currentPlayer());
});

define([], function () {

    //var currentOsd;
    //var currentPlayer;

    //function setCurrentItem(item) {

    //    var osd = currentOsd;

    //    if (!osd) {
    //        return;
    //    }

    //    osd.setItem(item);
    //}

    //function onPlaybackStart(e, player) {

    //    bindToPlayer(player);
    //    setCurrentItem(Emby.PlaybackManager.currentItem(player));
    //}

    //function onPlaybackStop(e, player) {
    //    releasePlayer();
    //    setCurrentItem(null);
    //}

    //function bindToPlayer(player) {

    //    if (player != currentPlayer) {

    //        releasePlayer();

    //        Events.on(player, 'volumechange', onVolumeChange);
    //        Events.on(player, 'timeupdate', onTimeUpdate);
    //        Events.on(player, 'pause', onPlaystateChange);
    //        Events.on(player, 'playing', onPlaystateChange);
    //    }

    //    currentPlayer = player;
    //    updateVolume(player);
    //    updateTime(player);
    //    updatePlaystate(player);
    //}

    //function releasePlayer() {

    //    var player = currentPlayer;

    //    if (player) {
    //        Events.off(player, 'volumechange', onVolumeChange);
    //        Events.off(player, 'timeupdate', onTimeUpdate);
    //        Events.off(player, 'pause', onPlaystateChange);
    //        Events.off(player, 'playing', onPlaystateChange);
    //        currentPlayer = null;
    //    }
    //}

    //function onTimeUpdate(e) {
    //    updateTime(this);
    //}

    //function onVolumeChange(e) {
    //    updateVolume(this);
    //}

    //function onPlaystateChange(e) {
    //    updatePlaystate(this);
    //}

    //function updatePlaystate(player) {

    //    var osd = currentOsd;

    //    if (!osd) {
    //        return;
    //    }

    //    osd.setPaused(Emby.PlaybackManager.paused());
    //    osd.setRepeatMode(Emby.PlaybackManager.getRepeatMode());
    //}

    //function onRepeatModeChanged() {
    //    updatePlaystate(currentPlayer);
    //}

    //function updateVolume(player) {

    //    var osd = currentOsd;

    //    if (!osd) {
    //        return;
    //    }

    //    osd.setVolume(Emby.PlaybackManager.volume());
    //    osd.setMuted(Emby.PlaybackManager.isMuted());
    //}

    //function updateTime(player) {

    //    var osd = currentOsd;

    //    if (!osd) {
    //        return;
    //    }

    //    var state = Emby.PlaybackManager.getPlayerState();
    //    var playState = state.PlayState || {};
    //    var nowPlayingItem = state.NowPlayingItem || {};

    //    osd.setPosition({
    //        positionTicks: playState.PositionTicks,
    //        runtimeTicks: nowPlayingItem.RunTimeTicks,
    //        canSeek: playState.CanSeek
    //    });
    //}

    //Events.on(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
    //Events.on(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
    //Events.on(Emby.PlaybackManager, 'repeatmodechange', onRepeatModeChanged);

    //onPlaybackStart(Emby.PlaybackManager.currentPlayer());
});

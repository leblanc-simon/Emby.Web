(function () {

    document.addEventListener("viewinit-defaulttheme-videoosd", function (e) {

        new nowPlayingPage(e.target, e.detail.params);
    });

    function nowPlayingPage(view, params) {

        var self = this;

        function onPlaybackStart(e, player) {

            //bindToPlayer(player);
            //setCurrentItem(Emby.PlaybackManager.currentItem(player));

            enableStopOnBack(true);
        }

        function onPlaybackStop(e, player) {
            //releasePlayer();
            //setCurrentItem(null);
        }

        view.addEventListener('viewshow', function (e) {

            Events.on(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.on(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);

            onPlaybackStart(e, Emby.PlaybackManager.currentPlayer());
        });

        view.addEventListener('viewhide', function () {

            Events.off(Emby.PlaybackManager, 'playbackstart', onPlaybackStart);
            Events.off(Emby.PlaybackManager, 'playbackstop', onPlaybackStop);
        });

        function onViewHideStopPlayback() {
            if (Emby.PlaybackManager.isPlayingVideo()) {
                Emby.PlaybackManager.stop();
            }
        }

        function enableStopOnBack(enabled) {

            view.removeEventListener('viewbeforehide', onViewHideStopPlayback);

            if (enabled) {
                if (Emby.PlaybackManager.isPlayingVideo()) {
                    view.addEventListener('viewbeforehide', onViewHideStopPlayback);
                }
            }
        }

    }

})();
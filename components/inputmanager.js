define([], function () {

    var lastInputTime = new Date().getTime();

    function notify() {
        lastInputTime = new Date().getTime();
    }

    function idleTime() {
        return new Date().getTime() - lastInputTime;
    }

    function select(sourceElement) {

        sourceElement.click();
    }

    var eventListenerCount = 0;
    function on(scope, fn) {
        eventListenerCount++;
        scope.addEventListener('command', fn);
    }

    function off(scope, fn) {

        if (eventListenerCount) {
            eventListenerCount--;
        }

        scope.removeEventListener('command', fn);
    }

    function handleCommand(name, options) {

        notify();

        var sourceElement = (options ? options.sourceElement : null) || document.activeElement || window;

        if (eventListenerCount) {
            var customEvent = new CustomEvent("command", {
                detail: {
                    command: name
                },
                bubbles: true,
                cancelable: true
            });

            var eventResult = sourceElement.dispatchEvent(customEvent);
            if (!eventResult) {
                // event cancelled
                return;
            }
        }

        switch (name) {

            case 'up':
                Emby.FocusManager.moveUp(sourceElement);
                break;
            case 'down':
                Emby.FocusManager.moveDown(sourceElement);
                break;
            case 'left':
                Emby.FocusManager.moveLeft(sourceElement);
                break;
            case 'right':
                Emby.FocusManager.moveRight(sourceElement);
                break;
            case 'home':
                Emby.Page.goHome();
                break;
            case 'back':
                Emby.Page.back();
                break;
            case 'forward':
                break;
            case 'select':
                select(sourceElement);
                break;
            case 'pageup':
                break;
            case 'pagedown':
                break;
            case 'end':
                break;
            case 'menu':
            case 'info':
                break;
            case 'next':
                Emby.PlaybackManager.nextTrack();
                break;
            case 'previous':
                Emby.PlaybackManager.previousTrack();
                break;
            case 'guide':
                break;
            case 'recordedtv':
                break;
            case 'record':
                break;
            case 'livetv':
                break;
            case 'togglemute':
                Emby.PlaybackManager.toggleMute();
                break;
            case 'volumedown':
                Emby.PlaybackManager.volumeDown();
                break;
            case 'volumeup':
                Emby.PlaybackManager.volumeUp();
                break;
            case 'play':
                break;
            case 'playpause':
                Emby.PlaybackManager.playPause();
                break;
            case 'stop':
                Emby.PlaybackManager.stop();
                break;
            case 'changezoom':
                break;
            case 'changeaudiotrack':
                break;
            case 'changesubtitletrack':
                break;
            case 'search':
                break;
            case 'favorites':
                break;
            case 'fastforward':
                Emby.PlaybackManager.fastForward();
                break;
            case 'rewind':
                Emby.PlaybackManager.rewind();
                break;
            default:
                break;
        }
    }

    document.addEventListener('click', notify);

    var inputManager = {
        handle: handleCommand,
        notify: notify,
        idleTime: idleTime,
        on: on,
        off: off
    };

    return inputManager;
});
define(['playbackManager', 'focusManager'], function (playbackManager, focusManager) {

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

    var commandTimes = {};

    function checkCommandTime(command) {

        var last = commandTimes[command] || 0;
        var now = new Date().getTime();

        if ((now - last) < 1000) {
            return false;
        }

        commandTimes[command] = now;
        return true;
    }

    function handleCommand(name, options) {

        notify();

        var sourceElement = (options ? options.sourceElement : null);

        if (sourceElement) {
            sourceElement = focusManager.focusableParent(sourceElement);
        }

        sourceElement = sourceElement || document.activeElement || window;

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
                focusManager.moveUp(sourceElement);
                break;
            case 'down':
                focusManager.moveDown(sourceElement);
                break;
            case 'left':
                focusManager.moveLeft(sourceElement);
                break;
            case 'right':
                focusManager.moveRight(sourceElement);
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
                playbackManager.nextTrack();
                break;
            case 'previous':
                playbackManager.previousTrack();
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
                playbackManager.toggleMute();
                break;
            case 'volumedown':
                playbackManager.volumeDown();
                break;
            case 'volumeup':
                playbackManager.volumeUp();
                break;
            case 'play':
                playbackManager.unpause();
                break;
            case 'pause':
                playbackManager.pause();
                break;
            case 'playpause':
                playbackManager.playPause();
                break;
            case 'stop':
                if (checkCommandTime('stop')) {
                    playbackManager.stop();
                }
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
                playbackManager.fastForward();
                break;
            case 'rewind':
                playbackManager.rewind();
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
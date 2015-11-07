define([], function () {

    var lastInputTime = new Date().getTime();

    function notify() {
        lastInputTime = new Date().getTime();
    }

    function idleTime() {
        return new Date().getTime() - lastInputTime;
    }

    function select() {

        var elem = document.activeElement;
        if (elem) {
            elem.click();
        }
    }

    function handleCommand(name, options) {

        notify();
        switch (name) {

            case 'up':
                Emby.FocusManager.moveUp((options ? options.sourceElement : null));
                break;
            case 'down':
                Emby.FocusManager.moveDown((options ? options.sourceElement : null));
                break;
            case 'left':
                Emby.FocusManager.moveLeft((options ? options.sourceElement : null));
                break;
            case 'right':
                Emby.FocusManager.moveRight((options ? options.sourceElement : null));
                break;
            case 'home':
                Emby.Page.goHome();
                break;
            case 'back':
                Emby.Page.back();
                break;
            case 'select':
                select();
                break;
            case 'pageup':
                break;
            case 'pagedown':
                break;
            case 'end':
                break;
            case 'menu':
                break;
            case 'nexttrack':
                break;
            case 'previoustrack':
                break;
            case 'next':
                break;
            case 'previous':
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
                break;
            case 'volumedown':
                break;
            case 'volumeup':
                break;
            case 'play':
                break;
            case 'playpause':
                break;
            case 'stop':
                break;
            case 'changezoom':
                break;
            case 'changeaudiotrack':
                break;
            default:
                break;
        }
    }

    document.addEventListener('click', notify);

    return {
        handle: handleCommand,
        notify: notify,
        idleTime: idleTime
    };
});
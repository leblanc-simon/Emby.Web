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
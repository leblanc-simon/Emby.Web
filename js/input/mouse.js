(function (document) {

    var lastMouseInputTime = new Date().getTime();
    var isMouseIdle;

    function mouseIdleTime() {
        return new Date().getTime() - lastMouseInputTime;
    }

    var lastMouseMoveData = {
        x: 0,
        y: 0
    };

    var inputreceiver;
    function notifyApp() {

        if (inputreceiver) {
            inputreceiver.notify();
            return;
        }

        require(['inputreceiver'], function (inputReceiverInstance) {
            inputreceiver = inputReceiverInstance;
            inputreceiver.notify();
        });
    }

    document.addEventListener('mousemove', function (e) {

        var obj = lastMouseMoveData;

        var eventX = e.screenX;
        var eventY = e.screenY;

        // if coord don't exist how could it move
        if (typeof eventX === "undefined" && typeof eventY === "undefined") {
            return;
        }

        // if coord are same, it didn't move
        if (Math.abs(eventX - obj.x) < 10 && Math.abs(eventY - obj.y) < 10) {
            return;
        }

        obj.x = eventX;
        obj.y = eventY;

        lastMouseInputTime = new Date().getTime();
        notifyApp();

        if (isMouseIdle) {
            isMouseIdle = false;
            document.body.classList.remove('mouseIdle');
        }
    });

    function onMouseEnter(e) {

        var parent = Emby.FocusManager.focusableParent(e.target);
        if (parent) {
            Emby.FocusManager.focus(e.target);
        }
    }

    function enableFocusWithMouse() {

        // This is going to be really difficult to get right
        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('xbox') != -1) {
            return true;
        }

        if (userAgent.indexOf('mobile') != -1) {
            return false;
        }

        if (userAgent.indexOf('tv') != -1) {
            return true;
        }

        if (userAgent.indexOf('samsung') != -1) {
            return true;
        }

        if (userAgent.indexOf('nintendo') != -1) {
            return true;
        }

        if (userAgent.indexOf('viera') != -1) {
            return true;
        }

        return false;
    }

    if (enableFocusWithMouse()) {
        document.addEventListener('mouseenter', onMouseEnter, true);
    }

    setInterval(function () {

        if (mouseIdleTime() >= 5000) {
            isMouseIdle = true;
            document.body.classList.add('mouseIdle');
        }

    }, 5000);

})(document);

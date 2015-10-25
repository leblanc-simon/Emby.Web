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

    setInterval(function () {

        if (mouseIdleTime() >= 5000) {
            isMouseIdle = true;
            document.body.classList.add('mouseIdle');
        }

    }, 5000);

})(document);

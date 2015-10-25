(function (document) {

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

    function sendCommand(name, sourceElement) {

        var options = {
            sourceElement: sourceElement
        };

        if (inputreceiver) {
            inputreceiver.handle(name, options);
            return;
        }

        require(['inputreceiver'], function (inputReceiverInstance) {
            inputreceiver = inputReceiverInstance;
            inputreceiver.handle(name, options);
        });
    }

    document.addEventListener('keydown', function (evt) {

        switch (evt.keyCode) {

            case 37:
                // left
                evt.preventDefault();
                evt.stopPropagation();
                sendCommand('left', evt.target);
                return false;
            case 38:
                // up
                evt.preventDefault();
                evt.stopPropagation();
                sendCommand('up', evt.target);
                return false;
            case 39:
                // right
                evt.preventDefault();
                evt.stopPropagation();
                sendCommand('right', evt.target);
                return false;
            case 40:
                // down
                evt.preventDefault();
                evt.stopPropagation();
                sendCommand('down', evt.target);
                return false;
            default:
                // No command will be executed, but notify the app that input was received
                notifyApp();
                break;
        }

    });

})(document);

(function (globalScope) {

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

    // Support opera tv aliases
    // https://dev.opera.com/tv/functional-key-handling-in-opera-tv-store-applications
    var leftAlias = globalScope.VK_LEFT || -999;
    var rightAlias = globalScope.VK_RIGHT || -999;
    var downAlias = globalScope.VK_DOWN || -999;
    var upAlias = globalScope.VK_UP || -999;

    globalScope.addEventListener('keydown', function (evt) {

        switch (evt.keyCode) {

            case 37:
            case leftAlias:
                // left
                evt.preventDefault();
                evt.stopPropagation();
                sendCommand('left', evt.target);
                return false;
            case 38:
            case upAlias:
                // up
                evt.preventDefault();
                evt.stopPropagation();
                sendCommand('up', evt.target);
                return false;
            case 39:
            case rightAlias:
                // right
                evt.preventDefault();
                evt.stopPropagation();
                sendCommand('right', evt.target);
                return false;
            case 40:
            case downAlias:
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

    }, true);

})(this, document);

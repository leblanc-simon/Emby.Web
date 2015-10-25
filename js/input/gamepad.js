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

    function sendCommand(name) {

        if (inputreceiver) {
            inputreceiver.handle(name);
            return;
        }

        require(['inputreceiver'], function (inputReceiverInstance) {
            inputreceiver = inputReceiverInstance;
            inputreceiver.handle(name);
        });
    }

    require(['components/gamepad'], function () {

        var gamepad = new Gamepad();

        console.log('Gamepad input supported: ' + gamepad.init());

        gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {

            //'LEFT_TOP_SHOULDER', 'RIGHT_TOP_SHOULDER', 'LEFT_BOTTOM_SHOULDER', 'RIGHT_BOTTOM_SHOULDER',
            //'SELECT_BACK', 'START_FORWARD', 'LEFT_STICK', 'RIGHT_STICK',
            //'DPAD_UP', 'DPAD_DOWN', 'DPAD_LEFT', 'DPAD_RIGHT',
            //'HOME'

            switch (e.control) {

                case 'DPAD_LEFT':
                    // left
                    sendCommand('left');
                    break;
                case 'DPAD_UP':
                    // up
                    sendCommand('up');
                    break;
                case 'DPAD_RIGHT':
                    // right
                    sendCommand('right');
                    break;
                case 'DPAD_DOWN':
                    // down
                    sendCommand('down');
                    break;
                case 'HOME':
                    sendCommand('home');
                    break;
                case 'FACE_0':
                case 'SELECT_BACK':
                    sendCommand('back');
                    break;
                case 'FACE_1':
                case 'START_FORWARD':
                    sendCommand('select');
                    break;
                default:
                    // No command will be executed, but notify the app that input was received
                    notifyApp();
                    break;
            }
        });

    });

})(document);

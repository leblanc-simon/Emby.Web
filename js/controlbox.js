define(['apphost'], function (apphost) {

    function bindEvents() {

        document.querySelector('.appExitButton').addEventListener('click', function () {
            apphost.exit();
        });

        document.querySelector('.minimizeButton').addEventListener('click', function () {
            apphost.setWindowState('Minimized');
        });

        document.querySelector('.maximizeButton').addEventListener('click', function () {
            if (apphost.getWindowState() == 'Normal') {
                apphost.setWindowState('Maximized');
            } else {
                apphost.setWindowState('Normal');
            }
        });
    }

    function loadControlBox() {

        if (apphost.supports('windowstate')) {

            document.querySelector('.controlBox').classList.remove('hide');
            //updateWindowState(apphost.getWindowState());
        } else {

            document.querySelector('.controlBox').classList.add('hide');
        }
    }

    loadControlBox();
    bindEvents();
});
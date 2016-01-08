(function () {

    function bindEvents() {

        document.querySelector('.appExitButton').addEventListener('click', function () {
            require(['apphost'], function (apphost) {
                apphost.exit();
            });
        });

        document.querySelector('.minimizeButton').addEventListener('click', function () {
            require(['apphost'], function (apphost) {
                apphost.setWindowState('Minimized');
            });
        });

        document.querySelector('.maximizeButton').addEventListener('click', function () {
            require(['apphost'], function (apphost) {

                if (apphost.getWindowState() == 'Normal') {
                    apphost.setWindowState('Maximized');
                } else {
                    apphost.setWindowState('Normal');
                }
            });
        });
    }

    function loadControlBox() {

        require(['apphost'], function (apphost) {

            if (apphost.supports('windowstate')) {

                document.querySelector('.controlBox').classList.remove('hide');
                //updateWindowState(apphost.getWindowState());
            } else {

                document.querySelector('.controlBox').classList.add('hide');
            }
        });

    }

    loadControlBox();
    bindEvents();

})(document);

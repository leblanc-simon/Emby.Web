(function () {

    function getButton(name, icon, option) {

        var html = '';
        html += '<paper-icon-button class="backMenuButton" icon="' + icon + '" data-option="' + option + '" data-name="' + name + '"></paper-icon-button>';

        return html;
    }

    function onFocusIn(e) {

        var btn = Emby.Dom.parentWithClass(e.target, 'backMenuButton');

        if (btn) {
            document.querySelector('.backMenuButtonTitle').innerHTML = btn.getAttribute('data-name');
        }
    }

    function show(options) {

        var isCancelled = true;

        require(['paperdialoghelper', 'apphost'], function (paperdialoghelper, apphost) {

            var dlg = paperdialoghelper.createDialog();

            dlg.classList.add('backMenu');

            var html = '';
            html += '<div style="text-align:center;">';

            html += '<div style="vertical-align:middle;">';

            if (options.showHome) {
                html += getButton(Globalize.translate('Home'), 'home', 'home');
            }

            html += getButton(Globalize.translate('Settings'), 'settings', 'settings');
            html += getButton(Globalize.translate('SignOut'), 'lock', 'logout');

            if (apphost.supports('exit')) {
                html += getButton(Globalize.translate('Exit'), 'exit-to-app', 'exit');
            }

            if (apphost.supports('sleep')) {
                html += '<div class="backMenuSeparator"></div>';
                html += getButton(Globalize.translate('Sleep'), 'timer-off', 'sleep');
            }

            if (apphost.supports('shutdown')) {
                html += getButton(Globalize.translate('Shutdown'), 'power-settings-new', 'shutdown');
            }

            if (apphost.supports('restart')) {
                html += getButton(Globalize.translate('Restart'), 'refresh', 'restart');
            }

            html += '</div>';

            html += '<h1 class="backMenuButtonTitle">&nbsp;';
            html += '</h1>';

            html += '</div>';

            dlg.innerHTML = html;
            document.body.appendChild(dlg);

            var activeElement = document.activeElement;

            dlg.addEventListener('focusin', onFocusIn);

            // Has to be assigned a z-index after the call to .open() 
            dlg.addEventListener('iron-overlay-closed', function (e) {

                this.parentNode.removeChild(this);

                activeElement.focus();

                if (isCancelled) {
                    options.cancelCallback();
                }
            });

            dlg.addEventListener('click', function (e) {

                var backMenuButton = Emby.Dom.parentWithClass(e.target, 'backMenuButton');

                if (backMenuButton) {

                    var option = backMenuButton.getAttribute('data-option');

                    isCancelled = false;
                    paperdialoghelper.close(dlg);

                    switch (option) {

                        case 'logout':
                            Emby.App.logout();
                            break;
                        case 'settings':
                            // TODO
                            break;
                        case 'home':
                            Emby.Page.goHome();
                            break;
                        case 'exit':
                            apphost.exit();
                            break;
                        case 'sleep':
                            apphost.sleep();
                            break;
                        case 'shutdown':
                            apphost.shutdown();
                            break;
                        case 'restart':
                            apphost.restart();
                            break;
                        default:
                            break;
                    }
                }

            });

            paperdialoghelper.open(dlg);
        });
    }

    DefaultTheme.BackMenu = {
        show: show
    };

})();
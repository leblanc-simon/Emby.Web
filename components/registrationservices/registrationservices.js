define(['connectionManager', 'paperdialoghelper', 'shell', 'css!components/registrationservices/style'], function (connectionManager, paperdialoghelper, shell) {

    function validateFeature(feature, showOverlay) {

        return connectionManager.getRegistrationInfo('embytheater-unlock', connectionManager.currentApiClient()).then(function (registrationInfo) {

            if (registrationInfo.IsRegistered && !registrationInfo.IsTrial) {
                return Promise.resolve();
            }

            if (showOverlay !== false) {
                return showUnlockOverlay(feature);
            }

            return Promise.reject();
        });
    }

    function showUnlockOverlay(feature) {

        var dlg = paperdialoghelper.createDialog({
            removeOnClose: true
        });

        dlg.classList.add('registrationDialog');

        var html = '';
        html += '<div class="registrationDialogContent">';

        html += '<paper-icon-button icon="arrow-back" class="btnRegistrationBack largeIcon" tabindex="-1"></paper-icon-button>';

        html += '<h1>Unlock this feature with Emby Premiere</h1>';

        html += '<p>If you have Emby Premiere, just sign in with Emby Connect, or connect to your Emby Server using your local network connection.</p>';

        html += '<br/>';
        html += '<paper-button raised class="register">';
        html += 'Get Emby Premiere';
        html += '</paper-button>';

        html += '</div>';

        dlg.innerHTML = html;
        document.body.appendChild(dlg);

        dlg.querySelector('.register').addEventListener('click', function (e) {

            shell.openUrl('http://emby.media/premiere');
        });

        dlg.querySelector('.btnRegistrationBack').addEventListener('click', function (e) {

            paperdialoghelper.close(dlg);
        });

        return paperdialoghelper.open(dlg).then(function () {
            return validateFeature(feature, false);
        });
    }

    return {
        validateFeature: validateFeature
    };

});
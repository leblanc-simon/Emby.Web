define(['connectionManager', 'paperdialoghelper', 'css!components/registrationservices/style'], function (connectionManager, paperdialoghelper) {

    var validatedFeatures = [];

    function validateFeature(feature, showOverlay) {

        if (validatedFeatures.indexOf(feature) != -1) {
            return Promise.resolve();
        }

        return connectionManager.getRegistrationInfo('embytheater-unlock', connectionManager.currentApiClient()).then(function (registrationInfo) {

            if (registrationInfo.IsRegistered && !registrationInfo.IsTrial) {
                validatedFeatures.push(feature);
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
            removeOnClose: true,
            size: 'fullscreen'
        });

        dlg.classList.add('registrationDialog');

        var html = '';
        html += '<div class="registrationDialogContent">';

        html += '<paper-icon-button icon="arrow-back" class="btnRegistrationBack" tabindex="-1"></paper-icon-button>';

        html += '<h1>Unlock this feature with Emby Premiere</h1>';

        html += '<p>If you have Emby Premiere, just sign in with Emby Connect, or connect to your Emby Server using your local network connection.</p>';

        html += '<br/>';
        html += '<paper-button raised class="register block">';
        html += 'Get Emby Premiere';
        html += '</paper-button>';
        html += '<paper-button raised class="tryPlay block">';
        html += 'Play One Minute';
        html += '</paper-button>';

        html += '</div>';

        dlg.innerHTML = html;
        document.body.appendChild(dlg);

        dlg.querySelector('.register').addEventListener('click', function (e) {

            require(['shell'], function (shell) {
                shell.openUrl('http://emby.media/premiere');
            });
        });

        dlg.querySelector('.tryPlay').addEventListener('click', function (e) {

            paperdialoghelper.close(dlg);
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
define(['paperdialoghelper'], function (paperdialoghelper) {

    return function (options) {

        if (typeof options === 'string') {
            options = {
                title: Globalize.translate('HeaderAlert'),
                text: options
            };
        }

        var message = options.text;
        var title = options.title;
        var callback = options.callback;

        var dlg = paperdialoghelper.createDialog();

        var html = '';
        html += '<h1>' + title + '</h1>';
        html += '<div>' + message + '</div>';
        html += '<div class="buttons">';

        html += '<paper-button class="btnConfirm" dialog-confirm autofocus>' + Globalize.translate('ButtonOk') + '</paper-button>';

        html += '</div>';

        dlg.innerHTML = html;
        document.body.appendChild(dlg);

        var activeElement = document.activeElement;

        // Has to be assigned a z-index after the call to .open() 
        dlg.addEventListener('iron-overlay-closed', function (e) {

            this.parentNode.removeChild(this);

            activeElement.focus();

            if (callback) {
                callback();
            }
        });

        paperdialoghelper.open(dlg);
    };
});
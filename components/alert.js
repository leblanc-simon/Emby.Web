define(['dialog'], function (dialog) {

    return function (options) {

        if (typeof options === 'string') {
            options = {
                title: '',
                text: options
            };
        }

        options.buttons = [Globalize.translate('ButtonOk')];

        dialog(options);
    };
});
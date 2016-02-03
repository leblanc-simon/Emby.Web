define(['dialog'], function (dialog) {

    return function (options) {

        if (typeof options === 'string') {
            options = {
                title: '',
                text: options
            };
        }

        options.buttons = [Globalize.translate('core#ButtonOk')];

        return dialog(options);
    };
});
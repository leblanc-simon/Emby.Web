define(['dialog'], function (dialog) {

    return function (options) {

        options.buttons = [Globalize.translate('core#ButtonOk'), Globalize.translate('core#ButtonCancel')];

        var callback = options.callback;

        options.callback() = function (index) {
            callback(index == 0);
        };

        dialog(options);
    };
});
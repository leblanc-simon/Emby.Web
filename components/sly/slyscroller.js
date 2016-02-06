define(['browser', 'Sly'], function (browser) {

    return {
        create: function (element, options) {

            if (browser.mobile) {
            
                options.enableNativeScroll = true;
            }

            var sly = new Sly(element, options);
            return Promise.resolve(sly);
        }
    };
});
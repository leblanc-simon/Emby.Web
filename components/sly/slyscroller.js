define([], function () {

    return {
        create: function (element, options) {

            return new Promise(function (resolve, reject) {

                require(['Sly'], function () {

                    var sly = new Sly(element, options);
                    resolve(sly);
                });
            });
        }
    };
});
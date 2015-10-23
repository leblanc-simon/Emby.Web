define([], function () {

    return {
        create: function (element, options) {

            return new Promise(function (resolve, reject) {

                require(['bower_components/sly/src/sly'], function () {

                    var sly = new Sly(element, options);
                    resolve(sly);
                });
            });
        }
    };
});
define([], function () {

    return {
        fileExists: function (path) {
            return new Promise(function (resolve, reject) {

                reject();
            });
        },
        directoryExists: function (path) {
            return new Promise(function (resolve, reject) {

                reject();
            });
        }
    };
});
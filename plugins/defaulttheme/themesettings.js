define(['userSettings', './themeinfo'], function (userSettings, themeinfo) {

    var settingsPrefix = themeinfo.id + '-';
    var obj = function () {

        var self = this;

        self.set = function (name, value) {

            userSettings.set(settingsPrefix + name, value);
        };

        self.get = function (name) {

            return userSettings.get(settingsPrefix + name);
        };

        self.enableAntiSpoliers = function (val) {

            if (val != null) {
                self.set('antispoilers', val.toString());
            }

            return self.get('antispoilers') != 'false';
        };

        self.dimUnselectedPosters = function (val) {

            if (val != null) {
                self.set('dimunselectedposters', val.toString());
            }

            return self.get('dimunselectedposters') == 'true';
        };

        self.apply = function () {

            if (self.dimUnselectedPosters()) {
                document.body.classList.add('dimunselected');
            } else {
                document.body.classList.remove('dimunselected');
            }
        };

        self.unload = function () {
            document.body.classList.remove('dimunselected');
        };
    };

    return new obj();
});
define([], function () {

    return function () {

        var self = this;

        self.name = 'Default Keyboard';
        self.type = 'keyboard';
        self.packageName = 'keyboard';

        function loadKeyLime() {

            return new Promise(function (resolve, reject) {

                if (window.keyLime) {
                    resolve();
                    return;
                }

                require([Emby.PluginManager.mapPath(self, 'keylime.js')], function () {
                    window.keyLime.config = window.keyLime.config || {};
                    window.keyLime.config.noauto = true;
                    resolve();
                });
            });

        }

        function showKeyLime() {
            window.keyLime.show();
        }

        self.show = function (field) {

            loadKeyLime().then(showKeyLime);

        };
    }
});
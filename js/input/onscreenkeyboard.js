(function (document) {

    function hasBuiltInKeyboard() {

        // This is going to be really difficult to get right
        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('xbox') != -1) {
            return true;
        }

        if (userAgent.indexOf('mobile') != -1) {
            return true;
        }

        if (userAgent.indexOf('tv') != -1) {
            return true;
        }

        if (userAgent.indexOf('samsung') != -1) {
            return true;
        }

        if (userAgent.indexOf('nintendo') != -1) {
            return true;
        }

        if (userAgent.indexOf('viera') != -1) {
            return true;
        }

        return false;
    }

    if (!hasBuiltInKeyboard()) {
        document.addEventListener('focus', function (evt) {

            var tag = evt.target.tagName;

            if ((evt.target.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA')) {

                var keyboard = getKeyboard();

                if (keyboard) {

                    keyboard.show(evt.target);
                    evt.stopPropagation();
                    evt.preventDefault();
                    return false;
                }
            }

        }, true);
    }

    function getKeyboard() {
        return Emby.PluginManager.ofType('keyboard')[0];
    }

})(document);

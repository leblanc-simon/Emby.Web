(function (globalScope) {

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function setStaticBackdrop() {

        //var path = Emby.PluginManager.mapPath('defaulttheme', 'css/images/blur' + getRandomInt(1, 6) + '.png');
        var path = Emby.PluginManager.mapPath('defaulttheme', 'css/images/blur7.png');
        Emby.Backdrop.setBackdrop(path);

        setTimeout(function() {
            document.querySelector('.themeContainer').classList.add('staticBackdrop');
        }, 1000);
    }

    function setBackdrops(items) {

        document.querySelector('.themeContainer').classList.remove('staticBackdrop');
        Emby.Backdrop.setBackdrops(items);
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.Backdrop = {
        setStaticBackdrop: setStaticBackdrop,
        setBackdrops: setBackdrops
    };

})(this);
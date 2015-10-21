(function (document) {

    document.addEventListener("viewshow-settings", function (e) {

        var element = e.detail.element;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        Emby.Page.setTitle(Globalize.translate('Settings'));

        require(['loading'], function (loading) {
            loading.hide();
        });
    });

})(document);
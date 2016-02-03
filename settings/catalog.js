define(['loading', 'packageManager'], function (loading, packageManager) {

    function renderPlugins(view) {

    }

    return function (view, params) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('Catalog'));

            loading.hide();

            if (!isRestored) {
                renderPlugins(view);
            }
        });
    }

});
define(['loading', 'packageManager'], function (loading, packageManager) {

    return function (view, params) {

        var self = this;

        view.addEventListener('viewbeforeshow', function (e) {

            var isRestored = e.detail.isRestored;

            Emby.Page.setTitle(Globalize.translate('Plugins'));

            loading.hide();

            if (!isRestored) {

            }
        });
    }

});
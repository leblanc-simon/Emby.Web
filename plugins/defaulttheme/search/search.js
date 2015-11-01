(function () {

    document.addEventListener("viewinit-defaulttheme-search", function (e) {

        new searchPage(e.detail.element, e.detail.params);
    });

    function searchPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle('');
            Emby.Backdrop.clear();
            document.querySelector('.headerSearchButton').classList.add('hide');
        });

        view.addEventListener('viewdestroy', function () {

            document.querySelector('.headerSearchButton').classList.remove('hide');
        });
    }

})();
(function () {

    document.addEventListener("viewinit-defaulttheme-search", function (e) {

        new searchPage(e.detail.element, e.detail.params);
    });

    function searchPage(view, params) {

        var self = this;

        function initAlphaPicker(view) {

            require(['alphapicker'], function (alphaPicker) {

                self.alphaPicker = new alphaPicker({
                    element: view.querySelector('.alphaPicker'),
                    mode: 'keyboard'
                });

                self.alphaPicker.focus();
            });
        }

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle('');
            Emby.Backdrop.clear();
            document.querySelector('.headerSearchButton').classList.add('hide');

            var isRestored = e.detail.isRestored;

            if (!isRestored) {
                initAlphaPicker(e.detail.element);
            }
        });

        view.addEventListener('viewhide', function () {

            document.querySelector('.headerSearchButton').classList.remove('hide');
        });

        view.addEventListener('viewdestroy', function () {

            if (self.alphaPicker) {
                self.alphaPicker.destroy();
            }
        });
    }

})();
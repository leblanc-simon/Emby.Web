(function () {

    document.addEventListener("viewinit-defaulttheme-guide", function (e) {

        new guidePage(e.target, e.detail.params);
    });

    function guidePage(view, params) {

        var self = this;
        var guideInstance;

        view.addEventListener('viewshow', function (e) {

            Emby.Page.setTitle(Globalize.translate('Guide'));
            Emby.Backdrop.clear();

            if (!e.detail.isRestored) {
                initGuide();
            }
        });

        view.addEventListener('viewdestroy', function () {

        });

        function initGuide() {

            require(['tvguide'], function (guide) {

                guideInstance = new guide({
                    element: view.querySelector('.epg')
                });
            });
        }
    }

})();
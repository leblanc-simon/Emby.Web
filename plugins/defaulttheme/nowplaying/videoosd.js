(function () {

    document.addEventListener("viewinit-defaulttheme-videoosd", function (e) {

        new nowPlayingPage(e.target, e.detail.params);
    });

    function nowPlayingPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function () {
        });

        view.addEventListener('viewhide', function () {
        });
    }

})();
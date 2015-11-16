define([], function () {

    function loadView(options) {

        return new Promise(function (resolve, reject) {

            var animatedPages = document.querySelector('.mainAnimatedPages');

            var html = '<div class="page-view" data-id="' + options.id + '" data-url="' + options.url + '">';
            html += options.view;
            html += '</div>';

            var mainAnimatedPages = document.querySelector('.mainAnimatedPages');

            var currentPage = mainAnimatedPages.querySelector('.page-view');

            if (currentPage) {
                view.dispatchEvent(new CustomEvent("viewdestroy", {}));
            }

            mainAnimatedPages.innerHTML = html;

            resolve(mainAnimatedPages.querySelector('.page-view'));
        });
    }

    function replaceAnimatedPages() {
        var elem = document.querySelector('neon-animated-pages.mainAnimatedPages');

        if (elem) {
            var div = document.createElement('div');
            div.classList.add('mainAnimatedPages');
            div.classList.add('themeContainer');
            elem.parentNode.replaceChild(div, elem);
        }
    }

    function tryRestoreView(options) {
        return new Promise(function (resolve, reject) {

            reject();
        });
    }

    function reset() {

    }

    replaceAnimatedPages();

    return {
        loadView: loadView,
        tryRestoreView: tryRestoreView,
        reset: reset
    };
});
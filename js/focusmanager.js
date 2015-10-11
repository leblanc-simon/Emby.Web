(function (globalScope, document) {

    function autoFocus(view, defaultToFirst) {

        var element = view.querySelector('*[autofocus]');
        if (element) {
            focus(element);
        } else if (defaultToFirst) {
            element = getFocusableElements(view)[0];

            if (element) {
                focus(element);
            }
        }
    }

    function focus(element) {

        if (element.tagName == 'PAPER-INPUT') {
            element = element.querySelector('input');
        }

        element.focus();
    }

    var focusableTagNames = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'PAPER-BUTTON', 'PAPER-INPUT', 'PAPER-TEXTAREA', 'PAPER-ICON-BUTTON', 'PAPER-FAB', 'PAPER-ICON-ITEM'];
    var focusableQuery = focusableTagNames.join(',') + ',.focusable';

    function isFocusable(elem) {

        if (focusableTagNames.indexOf(elem.tagName) != -1) {
            return true;
        }

        if (elem.classList && elem.classList.contains('focusable')) {
            return true;
        }

        return false;
    }

    function focusableParent(elem) {

        while (!isFocusable(elem)) {
            elem = elem.parentNode;

            if (!elem) {
                return null;
            }
        }

        return elem;
    }

    function getFocusableElements(parent) {
        var elems = (parent || document).querySelectorAll(focusableQuery);
        var focusableElements = [];

        for (var i = 0, length = elems.length; i < length; i++) {

            var elem = elems[i];

            // http://stackoverflow.com/questions/19669786/check-if-element-is-visible-in-dom
            if (elem.offsetParent === null) {
                continue;
            }

            focusableElements.push(elem);
        }

        return focusableElements;
    }

    if (!globalScope.Emby) {
        globalScope.Emby = {};
    }

    globalScope.Emby.FocusManager = {
        autoFocus: autoFocus,
        focus: focus,
        focusableParent: focusableParent,
        getFocusableElements: getFocusableElements
    };

})(this, document);

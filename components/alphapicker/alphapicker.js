define(['css!components/alphapicker/style.css'], function () {

    function focus() {
        var selected = this.querySelector('.selected');

        if (selected) {
            Emby.FocusManager.focus(selected);
        } else {
            Emby.FocusManager.autoFocus(this, true);
        }
    }

    function getLetterButton(l) {
        return '<button data-value="' + l + '" class="clearButton alphaPickerButton">' + l + '</button>';
    }

    function render(element, options) {

        element.classList.add('alphaPicker');
        element.classList.add('focuscontainer-x');

        var html = '';
        var letters;

        if (options.mode == 'keyboard') {
            letters = ['#'];
            html += letters.map(getLetterButton).join('');
        } else {
            letters = ['#'];
            html += letters.map(getLetterButton).join('');
        }

        letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        html += letters.map(getLetterButton).join('');

        element.innerHTML = html;

        if (options.mode != 'keyboard') {
            element.querySelector('.alphaPickerButton').classList.add('selected');
        }

        element.classList.add('focusable');
        element.focus = focus;
    }

    function alphaPicker(options) {

        var self = this;

        var element = options.element;
        var itemsContainer = options.itemsContainer;
        var itemClass = options.itemClass;

        var itemFocusValue;
        var itemFocusTimeout;

        function onItemFocusTimeout() {
            itemFocusTimeout = null;
            self.value(itemFocusValue);
        }

        var alphaFocusedElement;
        var alphaFocusTimeout;

        function onAlphaFocusTimeout() {

            alphaFocusTimeout = null;

            if (document.activeElement == alphaFocusedElement) {
                var value = alphaFocusedElement.getAttribute('data-value');

                self.value(value, true);
            }
        }

        function onAlphaPickerFocusIn(e) {

            if (alphaFocusTimeout) {
                clearTimeout(alphaFocusTimeout);
                alphaFocusTimeout = null;
            }

            var alphaPickerButton = Emby.Dom.parentWithClass(e.target, 'alphaPickerButton');

            if (alphaPickerButton) {
                alphaFocusedElement = alphaPickerButton;
                alphaFocusTimeout = setTimeout(onAlphaFocusTimeout, 100);
            }
        }

        function onItemsFocusIn(e) {

            var item = Emby.Dom.parentWithClass(e.target, itemClass);

            if (item) {
                var prefix = item.getAttribute('data-prefix');
                if (prefix && prefix.length) {

                    itemFocusValue = prefix[0];
                    if (itemFocusTimeout) {
                        clearTimeout(itemFocusTimeout);
                    }
                    itemFocusTimeout = setTimeout(onItemFocusTimeout, 100);
                }
            }
        }

        self.enabled = function (enabled) {

            if (enabled) {

                if (itemsContainer) {
                    itemsContainer.addEventListener('focus', onItemsFocusIn, true);
                }

                element.addEventListener('focus', onAlphaPickerFocusIn, true);

            } else {

                if (itemsContainer) {
                    itemsContainer.removeEventListener('focus', onItemsFocusIn);
                }

                element.removeEventListener('focus', onAlphaPickerFocusIn);
            }
        };

        self.on = function (name, fn) {
            element.addEventListener(name, fn);
        };

        self.off = function (name, fn) {
            element.removeEventListener(name, fn);
        };

        self.destroy = function () {

            self.enabled(false);
            element.classList.remove('focuscontainer-x');
        };

        self.visible = function (visible) {

            element.style.visibility = visible ? 'visible' : 'hidden';
        };

        var currentValue;
        self.value = function (value, applyValue) {

            if (value != null) {

                value = value.toUpperCase();
                currentValue = value;

                if (options.mode != 'keyboard') {
                    var selected = element.querySelector('.selected');
                    var btn = element.querySelector('.alphaPickerButton[data-value=\'' + value + '\']');

                    if (btn && btn != selected) {
                        btn.classList.add('selected');
                    }
                    if (selected && selected != btn) {
                        selected.classList.remove('selected');
                    }
                }

                if (applyValue) {
                    element.dispatchEvent(new CustomEvent("alphavaluechanged", {
                        value: value
                    }));
                }
            }

            return currentValue;
        };

        self.focus = function () {
            Emby.FocusManager.autoFocus(element, true);
        };

        render(element, options);

        self.enabled(true);
        self.visible(true);
    }

    return alphaPicker;
});
define(['css!components/alphapicker/style.css'], function () {

    function focus() {
        var selected = this.querySelector('.selected');

        if (selected) {
            Emby.FocusManager.focus(selected);
        } else {
            Emby.FocusManager.autoFocus(this, true);
        }
    }

    function render(element) {

        element.classList.add('alphaPicker');
        element.classList.add('focuscontainer-x');

        var letters = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

        var html = letters.map(function (l) {

            return '<button data-value="' + l + '" class="clearButton alphaPickerButton">' + l + '</button>';

        }).join('');

        element.innerHTML = html;

        element.querySelector('.alphaPickerButton').classList.add('selected');

        //element.classList.add('focusable');
        //element.focus = focus;
    }

    function alphaPicker(options) {

        var self = this;

        var element = options.element;
        var itemsContainer = options.itemsContainer;
        var itemClass = options.itemClass;

        function onItemsFocusIn(e) {

            var item = Emby.Dom.parentWithClass(e.target, itemClass);

            if (item) {
                var prefix = item.getAttribute('data-prefix');
                if (prefix && prefix.length) {
                    self.value(prefix[0]);
                }
            }
        }

        self.enabled = function (enabled) {

            if (enabled) {
                itemsContainer.addEventListener('focus', onItemsFocusIn, true);
            } else {
                itemsContainer.removeEventListener('focus', onItemsFocusIn);
            }
        };

        self.destroy = function () {

            self.enabled(false);
            element.classList.remove('focuscontainer-x');
        };

        self.visible = function (visible) {

            element.style.visibility = visible ? 'visible' : 'hidden';
        };

        self.value = function (value) {

            if (value != null) {

                var selected = element.querySelector('.selected');
                var btn = element.querySelector('.alphaPickerButton[data-value=\'' + value.toUpperCase() + '\']');

                if (btn && btn != selected) {
                    btn.classList.add('selected');
                }
                if (selected && selected != btn) {
                    selected.classList.remove('selected');
                }
            }
        };

        self.setDefault = function () {

        };

        render(element);

        self.enabled(true);
        self.visible(true);
    }

    return alphaPicker;
});
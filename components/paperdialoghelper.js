define(['paper-dialog', 'scale-up-animation', 'fade-out-animation', 'fade-in-animation'], function () {

    function paperDialogHashHandler(dlg, hash, lockDocumentScroll) {

        function onHashChange(e) {

            var state = e.state || {};
            var isActive = state.dialogId == hash;

            var isBack = self.originalUrl == window.location.href;

            //if (isBack) {
            if (dlg) {
                if (!isActive) {
                    dlg.close();
                    dlg = null;
                }
            }
            //}
        }

        var activeElement = document.activeElement;

        function onDialogClosed() {

            if (lockDocumentScroll !== false) {
                //Dashboard.onPopupClose();
            }

            dlg = null;
            if (enableHashChange()) {

                window.removeEventListener('popstate', onHashChange);

                var state = history.state || {};
                if (state.dialogId == hash) {
                    history.back();
                }
            }

            activeElement.focus();
        }

        var self = this;

        self.originalUrl = window.location.href;

        dlg.addEventListener('iron-overlay-closed', onDialogClosed);
        dlg.open();

        if (lockDocumentScroll !== false) {
            //Dashboard.onPopupOpen();
        }

        if (enableHashChange()) {

            history.pushState({ dialogId: hash }, "Dialog", hash);

            window.addEventListener('popstate', onHashChange);
        }
    }

    function enableHashChange() {
        // It's not firing popstate in response to hashbang changes
        //if ($.browser.msie) {
        //    return false;
        //}
        return true;
    }

    function openWithHash(dlg) {

        new paperDialogHashHandler(dlg, 'dlg' + new Date().getTime());
    }

    function close(dlg) {

        if (enableHashChange()) {

            if (dlg.opened) {
                history.back();
            }

        } else {
            dlg.close();
        }
    }

    function onDialogOpened(e) {

        Emby.FocusManager.autoFocus(e.target, true);
    }

    function createDialog(options) {

        options = options || {};

        var dlg = document.createElement('paper-dialog');

        dlg.setAttribute('with-backdrop', 'with-backdrop');
        dlg.setAttribute('role', 'alertdialog');

        // without this safari will scroll the background instead of the dialog contents
        // but not needed here since this is already on top of an existing dialog
        // but skip it in IE because it's causing the entire browser to hang
        //if (!$.browser.msie) {
        dlg.setAttribute('modal', 'modal');
        //}

        //// seeing max call stack size exceeded in the debugger with this
        dlg.setAttribute('noAutoFocus', 'noAutoFocus');

        dlg.entryAnimation = options.entryAnimation || 'scale-up-animation';
        dlg.exitAnimation = 'fade-out-animation';

        dlg.animationConfig = {
            // scale up
            'entry': {
                name: options.entryAnimation || 'scale-up-animation',
                node: dlg,
                timing: { duration: options.entryAnimationDuration || 300, easing: 'ease-out' }
            },
            // fade out
            'exit': {
                name: 'fade-out-animation',
                node: dlg,
                timing: { duration: options.exitAnimationDuration || 400, easing: 'ease-in' }
            }
        };

        dlg.classList.add('popupEditor');

        if (options.size == 'small') {
            dlg.classList.add(options.size + '-paper-dialog');
        }

        dlg.classList.add('dialog');
        dlg.classList.add('smoothScrollY');

        dlg.addEventListener('iron-overlay-opened', onDialogOpened);

        return dlg;
    }

    function positionTo(dlg, elem) {

        var windowHeight = $(window).height();

        // If the window height is under a certain amount, don't bother trying to position
        // based on an element.
        if (windowHeight >= 540) {

            var pos = $(elem).offset();

            pos.top += elem.offsetHeight / 2;
            pos.left += elem.offsetWidth / 2;

            // Account for margins
            pos.top -= 24;
            pos.left -= 24;

            // Account for popup size - we can't predict this yet so just estimate
            pos.top -= $(dlg).height() / 2;
            pos.left -= $(dlg).width() / 2;

            // Account for scroll position
            pos.top -= $(window).scrollTop();
            pos.left -= $(window).scrollLeft();

            // Avoid showing too close to the bottom
            pos.top = Math.min(pos.top, windowHeight - 300);
            pos.left = Math.min(pos.left, $(window).width() - 300);

            // Do some boundary checking
            pos.top = Math.max(pos.top, 0);
            pos.left = Math.max(pos.left, 0);

            dlg.style.position = 'fixed';
            dlg.style.left = pos.left + 'px';
            dlg.style.top = pos.top + 'px';
        }
    }

    return {
        open: openWithHash,
        close: close,
        createDialog: createDialog,
        positionTo: positionTo
    };
});
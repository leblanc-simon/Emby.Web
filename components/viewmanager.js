define(['viewcontainer'], function (viewcontainer) {

    var currentView;

    viewcontainer.setOnBeforeChange(function () {
        dispatchViewHide('viewbeforehide');
    });

    function onViewChange(view, viewId, viewType, url, state, isRestore) {

        dispatchViewHide('viewhide');

        currentView = view;

        require(['bower_components/query-string/index'], function () {

            var eventDetail = getViewEventDetail(view, url, state, isRestore);

            if (!isRestore) {
                view.dispatchEvent(new CustomEvent("viewinit-" + viewId, eventDetail));
            }

            if (!isRestore) {
                Emby.FocusManager.autoFocus(view);
            }
            else if (view.activeElement) {
                view.activeElement.focus();
            }

            view.dispatchEvent(new CustomEvent("viewshow-" + viewId, eventDetail));
            view.dispatchEvent(new CustomEvent("viewshow", eventDetail));
        });
    }

    function dispatchViewHide(eventName) {

        var lastView = currentView;

        if (lastView) {
            lastView.dispatchEvent(new CustomEvent(eventName, {
                detail: {
                    id: lastView.getAttribute('data-id'),
                    type: lastView.getAttribute('data-type')
                },
                bubbles: true,
                cancelable: false
            }));
        }
    }

    function getViewEventDetail(view, url, state, isRestore) {

        var index = url.indexOf('?');
        var params = index == -1 ? {} : queryString.parse(url.substring(index + 1));

        return {
            detail: {
                id: view.getAttribute('data-id'),
                type: view.getAttribute('data-type'),
                params: params,
                isRestored: isRestore,
                state: state
            },
            bubbles: true,
            cancelable: false
        };
    }

    function resetCachedViews() {
        // Reset all cached views whenever the theme changes
        viewcontainer.reset();
    }

    document.addEventListener('themeunload', resetCachedViews);
    document.addEventListener('usersignedin', resetCachedViews);
    document.addEventListener('usersignedout', resetCachedViews);

    function tryRestoreInternal(viewcontainer, options, resolve, reject) {

        if (options.cancel) {
            return;
        }

        viewcontainer.tryRestoreView(options).then(function (view) {

            onViewChange(view, options.id, options.type, options.url, options.state, true);
            resolve();

        }, reject);
    }

    function ViewManager() {

        var self = this;

        self.loadView = function (options) {

            var lastView = currentView;

            // Record the element that has focus
            if (lastView) {
                lastView.activeElement = document.activeElement;
            }

            if (options.cancel) {
                return;
            }

            viewcontainer.loadView(options).then(function (view) {

                onViewChange(view, options.id, options.type, options.url, options.state);
            });
        };

        self.tryRestoreView = function (options) {
            return new Promise(function (resolve, reject) {

                if (options.cancel) {
                    return;
                }

                // Record the element that has focus
                if (currentView) {
                    currentView.activeElement = document.activeElement;
                }

                tryRestoreInternal(viewcontainer, options, resolve, reject);
            });
        };
    }

    return new ViewManager();
});

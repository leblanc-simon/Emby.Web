(function (globalScope) {

    function createHeaderScroller(view, initialTabId) {

        require(['slyScroller', 'loading'], function (slyScroller, loading) {

            view = view.querySelector('.userViewNames');

            var scrollFrame = view.querySelector('.scrollFrame');

            scrollFrame.style.display = 'block';

            var options = {
                horizontal: 1,
                itemNav: 'centered',
                mouseDragging: 1,
                touchDragging: 1,
                slidee: view.querySelector('.scrollSlider'),
                itemSelector: '.btnUserViewHeader',
                activateOn: 'focus',
                smart: true,
                releaseSwing: true,
                scrollBar: view.querySelector('.scrollbar'),
                scrollBy: 200,
                speed: 500,
                elasticBounds: 1,
                dragHandle: 1,
                dynamicHandle: 1,
                clickBar: 1
            };

            slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                slyFrame.init();
                loading.hide();

                var initialTab = initialTabId ? view.querySelector('.btnUserViewHeader[data-id=\'' + initialTabId + '\']') : null;

                if (!initialTab) {
                    initialTab = view.querySelector('.btnUserViewHeader');
                }
                Emby.FocusManager.focus(initialTab);
            });
        });
    }

    function initEvents(view, instance) {

        // Catch events on the view headers
        var userViewNames = view.querySelector('.userViewNames');
        userViewNames.addEventListener('mousedown', function (e) {

            var elem = Emby.Dom.parentWithClass(e.target, 'btnUserViewHeader');

            if (elem) {
                elem.focus();
            }
        });

        userViewNames.addEventListener('focus', function (e) {

            var elem = Emby.Dom.parentWithClass(e.target, 'btnUserViewHeader');

            if (elem) {
                instance.setFocusDelay(view, elem);
            }
        }, true);
    }

    function selectUserView(page, id, self) {

        var btn = page.querySelector(".btnUserViewHeader[data-id='" + id + "']");

        self.bodySlyFrame.slideTo(0, true);

        page.querySelector('.contentScrollSlider').innerHTML = '';
        var promise = self.loadViewContent.call(self, page, id, btn.getAttribute('data-type'));

        if (promise) {
            promise.then(function () {
                fadeInRight(page.querySelector('.contentScrollSlider'));
            });
        }
    }

    function fadeInRight(elem, iterations) {

        var translateX = Math.round(window.innerWidth / 100);
        var keyframes = [
          { opacity: '0', transform: 'translate3d(' + translateX + 'px, 0, 0)', offset: 0 },
          { opacity: '1', transform: 'none', offset: 1 }];
        var timing = { duration: 300, iterations: iterations };
        elem.animate(keyframes, timing);
    }

    function tabbedPage(page, pageOptions) {

        var self = this;
        pageOptions = pageOptions || {};

        // lock the height so that the location of the top tabs won't fluctuate
        var contentScrollSlider = page.querySelector('.contentScrollSlider');
        contentScrollSlider.style.minHeight = contentScrollSlider.offsetHeight + 'px';
        contentScrollSlider.classList.add('focuscontainer-x');

        var selectedItemInfoInner = page.querySelector('.selectedItemInfoInner');
        var selectedIndexElement = page.querySelector('.selectedIndex');

        var tagName = Emby.Dom.supportsWebComponents() ? 'paper-button' : 'button';

        self.renderTabs = function (tabs, initialTabId) {

            page.querySelector('.viewsScrollSlider').innerHTML = tabs.map(function (i) {

                return '<' + tagName + ' class="flat btnUserViewHeader" data-id="' + i.Id + '" data-type="' + (i.CollectionType || '') + '"><h2>' + i.Name + '</h2></' + tagName + '>';

            }).join('');

            createHeaderScroller(page, initialTabId);
            initEvents(page, self);
            createHorizontalScroller(page);
        };

        page.querySelector('.viewsScrollSlider').classList.add('focusable');
        page.querySelector('.viewsScrollSlider').focus = focusViewSlider;

        function onAlphaPickerValueChanged() {

            var value = pageOptions.alphaPicker.value();

            var card = contentScrollSlider.querySelector('.card[data-prefix^=\'' + value + '\']');

            if (card) {
                self.bodySlyFrame.toCenter(card, false);
            }
        }

        if (pageOptions.alphaPicker) {
            pageOptions.alphaPicker.on('alphavaluechanged', onAlphaPickerValueChanged);
        }

        function focusViewSlider() {

            var selected = this.querySelector('.selected');

            if (selected) {
                Emby.FocusManager.focus(selected);
            } else {
                Emby.FocusManager.autoFocus(this, true);
            }
        }

        var focusTimeout;
        self.setFocusDelay = function (view, elem) {

            var viewId = elem.getAttribute('data-id');

            var btn = view.querySelector('.btnUserViewHeader.selected');

            if (btn) {

                if (viewId == btn.getAttribute('data-id')) {
                    return;
                }
                btn.classList.remove('selected');
            }

            elem.classList.add('selected');

            if (focusTimeout) {
                clearTimeout(focusTimeout);
            }
            focusTimeout = setTimeout(function () {

                selectUserView(view, viewId, self);

            }, 700);
        };

        function createHorizontalScroller(view) {

            require(["slyScroller", 'loading'], function (slyScroller, loading) {

                var scrollFrame = view.querySelector('.itemScrollFrame');

                scrollFrame.style.display = 'block';

                var options = {
                    horizontal: 1,
                    itemNav: 0,
                    mouseDragging: 1,
                    touchDragging: 1,
                    slidee: view.querySelector('.contentScrollSlider'),
                    itemSelector: '.card',
                    smart: true,
                    releaseSwing: true,
                    scrollBar: view.querySelector('.contentScrollbar'),
                    scrollBy: 200,
                    speed: 340,
                    immediateSpeed: pageOptions.immediateSpeed,
                    elasticBounds: 1,
                    dragHandle: 1,
                    dynamicHandle: 1,
                    clickBar: 1,
                    centerOffset: window.innerWidth * .15
                };

                slyScroller.create(scrollFrame, options).then(function (slyFrame) {
                    self.bodySlyFrame = slyFrame;
                    self.bodySlyFrame.init();
                    initFocusHandler(view, self.bodySlyFrame);
                });
            });
        }

        function initFocusHandler(view) {

            if (pageOptions.handleFocus) {

                var scrollSlider = view.querySelector('.contentScrollSlider');

                require([Emby.PluginManager.mapPath('defaulttheme', 'cards/focushandler.js')], function (focusHandler) {

                    self.focusHandler = new focusHandler({
                        parent: scrollSlider,
                        selectedItemInfoInner: selectedItemInfoInner,
                        selectedIndexElement: selectedIndexElement,
                        animateFocus: pageOptions.animateFocus,
                        slyFrame: self.bodySlyFrame
                    });

                });
            }
        }

        self.destroy = function () {

            if (pageOptions.alphaPicker) {
                pageOptions.alphaPicker.off('alphavaluechanged', onAlphaPickerValueChanged);
            }

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null
            }
            if (self.bodySlyFrame) {
                self.bodySlyFrame.destroy();
                self.bodySlyFrame = null
            }
        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.TabbedPage = tabbedPage;

})(this);
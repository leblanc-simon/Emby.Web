(function (globalScope) {

    function horizontalList(options) {

        var self = this;
        var getItemsMethod = options.getItemsMethod;

        self.render = function () {

            if (options.itemsContainer) {

                require([Emby.PluginManager.mapPath('defaulttheme', 'cards/focushandler.js')], function (focusHandler) {

                    self.focusHandler = new focusHandler({
                        parent: options.itemsContainer,
                        selectedItemInfoInner: options.selectedItemInfoElement,
                        selectedIndexElement: options.selectedIndexElement,
                        slyFrame: options.slyFrame,
                        selectedItemMode: options.selectedItemMode
                    });

                });
            }

            require(['loading'], function (loading) {

                loading.show();

                getItemsMethod(0, 2000).then(function (result) {

                    // Normalize between the different response types
                    if (result.Items == null && result.TotalRecordCount == null) {

                        result = {
                            Items: result,
                            TotalRecordCount: result.length
                        };
                    }

                    self.items = result.Items;

                    if (options.listCountElement) {
                        options.listCountElement.innerHTML = result.TotalRecordCount;
                        options.listNumbersElement.classList.remove('hide');
                    }

                    var cardOptions = options.cardOptions || {};
                    cardOptions.itemsContainer = options.itemsContainer;
                    cardOptions.shape = cardOptions.shape || 'auto';
                    cardOptions.rows = cardOptions.rows || 1;

                    DefaultTheme.CardBuilder.buildCards(result.Items, cardOptions);

                    loading.hide();

                    if (options.onRender) {
                        options.onRender();
                    }

                    if (options.autoFocus !== false) {
                        setTimeout(function () {
                            var firstCard = options.itemsContainer.querySelector('.card');
                            if (firstCard) {
                                Emby.FocusManager.focus(firstCard);
                            }
                        }, 400);
                    }
                });
            });
        };

        self.destroy = function () {

            if (self.focusHandler) {
                self.focusHandler.destroy();
                self.focusHandler = null;
            }

            if (options.selectedItemInfoElement) {
                options.selectedItemInfoElement.innerHTML = '';
                options.selectedItemInfoElement.classList.remove('selectedItemInfoInnerWithLogo');
            }
        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.HorizontalList = horizontalList;

})(this);
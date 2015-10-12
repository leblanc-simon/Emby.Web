(function (globalScope) {

    function loadLatest(element, parentId, autoFocus) {

        var options = {

            Limit: 24,
            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.latestItems(options).then(function (result) {

            var section = element.querySelector('.latestSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            DefaultTheme.CardBuilder.buildCards(result, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                autoFocus: autoFocus
            });
        });
    }

    function view(element, parentId, autoFocus) {
        var self = this;

        loadLatest(element, parentId, autoFocus);

        var allGenericCard = element.querySelector('.allGenericCard');
        allGenericCard.setAttribute('data-id', parentId);
        allGenericCard.setAttribute('data-type', 'Folder');
        allGenericCard.setAttribute('data-isfolder', 'true');
        allGenericCard.setAttribute('data-action', 'link');
        allGenericCard.classList.add('itemAction');

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.genericView = view;

})(this);
(function (globalScope) {

    function loadAll(element, parentId, autoFocus) {

        var options = {

            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb"
        };

        Emby.Models.items(options).then(function (result) {

            var section = element.querySelector('.allSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                autoFocus: autoFocus,
                coverImage: true,
                showTitle: true
            });
        });
    }

    function view(element, parentId, autoFocus) {
        var self = this;

        loadAll(element, parentId, autoFocus);

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.genericView = view;

})(this);
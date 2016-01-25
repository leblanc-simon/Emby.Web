define([], function () {

    function loadAll(element, parentId, autoFocus) {

        Emby.Models.collections({

            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb",
            SortBy: 'SortName'

        }).then(function (result) {

            var section = element.querySelector('.allSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                autoFocus: autoFocus
            });
        });
    }

    function view(element, parentId, autoFocus) {
        var self = this;

        loadAll(element, parentId, autoFocus);

        self.destroy = function () {

        };
    }

    return view;
});
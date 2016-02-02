define([], function () {

    function loadAll(element, parentId, autoFocus) {

        var options = {

            ParentId: parentId,
            EnableImageTypes: "Primary,Backdrop,Thumb",
            SortBy: 'SortName'
        };

        return Emby.Models.playlists(options).then(function (result) {

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
                showTitle: true
            });
        });
    }

    function view(element, parentId, autoFocus) {
        var self = this;

        self.loadData = function (isRefresh) {

            if (isRefresh) {
                return Promise.resolve();
            }

            return loadAll(element, parentId, autoFocus);
        };

        self.destroy = function () {

        };
    }

    return view;
});
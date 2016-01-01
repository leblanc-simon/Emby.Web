(function () {

    document.addEventListener("viewinit-defaulttheme-livetv", function (e) {

        new liveTVPage(e.target, e.detail.params);
    });

    function liveTVPage(view, params) {

        var self = this;

        view.addEventListener('viewshow', function (e) {

            require(['loading'], function (loading) {

                if (!self.tabbedPage) {
                    loading.show();
                    renderTabs(view, params.tab, self, params);
                }

                Emby.Page.setTitle(Globalize.translate('LiveTV'));
                Emby.Backdrop.clear();
            });
        });

        view.addEventListener('viewdestroy', function () {

            if (self.tabbedPage) {
                self.tabbedPage.destroy();
            }
        });
    }

    function renderTabs(view, initialTabId, pageInstance, params) {

        var tabs = [
        {
            Name: Globalize.translate('Channels'),
            Id: "channels"
        },
        {
            Name: Globalize.translate('Recordings'),
            Id: "recordings"
        },
        {
            Name: Globalize.translate('Scheduled'),
            Id: "scheduled"
        }];

        var tabbedPage = new DefaultTheme.TabbedPage(view);
        tabbedPage.loadViewContent = loadViewContent;
        tabbedPage.params = params;
        tabbedPage.renderTabs(tabs, initialTabId);
        pageInstance.tabbedPage = tabbedPage;
    }

    function loadViewContent(page, id, type) {

    }

})();
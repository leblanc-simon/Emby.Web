(function (globalScope) {

    function loadChannels(element, parentId, autoFocus) {

        Emby.Models.channels().then(function (result) {

            var section = element.querySelector('.channelsSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                rows: 3,
                width: DefaultTheme.CardBuilder.homeThumbWidth,
                preferThumb: true,
                autoFocus: autoFocus
            });

            var latestContainer = element.querySelector('.latestContainer');

            for (var i = 0, length = result.Items.length; i < length; i++) {
                loadLatest(latestContainer, result.Items[i]);
            }
        });
    }

    function loadLatest(element, channel) {

        var html = '\
<div class="sectionTitle">'+ Globalize.translate('LatestFromValue', channel.Name) + '</div>\
<div class="itemsContainer">\
</div>';

        var section = document.createElement('div');
        section.classList.add('hide');
        section.classList.add('horizontalSection');

        section.innerHTML = html;
        element.appendChild(section);

        var options = {

            Limit: 6,
            ChannelIds: channel.Id
        };

        Emby.Models.latestChannelItems(options).then(function (result) {

            DefaultTheme.CardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'autoHome',
                preferThumb: true,
                showTitle: false
            });
        });
    }

    function view(element, parentId, autoFocus) {

        var self = this;

        loadChannels(element, parentId, autoFocus);

        self.destroy = function () {

        };
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.channelsView = view;

})(this);
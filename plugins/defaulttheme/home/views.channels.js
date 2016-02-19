define(['./../cards/cardbuilder'], function (cardBuilder) {

    function loadChannels(element, parentId, autoFocus) {

        return Emby.Models.channels().then(function (result) {

            var section = element.querySelector('.channelsSection');

            // Needed in case the view has been destroyed
            if (!section) {
                return;
            }

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'backdropCard',
                rows: 3,
                preferThumb: true,
                autoFocus: autoFocus
            });

            var latestContainer = element.querySelector('.latestContainer');

            latestContainer.innerHTML = '';

            return Promise.all(result.Items.map(function (i) {
                return loadLatest(latestContainer, i);
            }));
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

        return Emby.Models.latestChannelItems(options).then(function (result) {

            cardBuilder.buildCards(result.Items, {
                parentContainer: section,
                itemsContainer: section.querySelector('.itemsContainer'),
                shape: 'auto',
                showTitle: false
            });
        });
    }

    function view(element, parentId, autoFocus) {

        var self = this;

        self.loadData = function () {
            return loadChannels(element, parentId, autoFocus);
        };

        self.destroy = function () {

        };
    }

    return view;
});
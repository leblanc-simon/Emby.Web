define(['paper-icon-button', 'coreIcons'], function () {

    function getUserDataButtonHtml(method, itemId, btnCssClass, icon, tooltip, style) {

        var tagName = style == 'fab' ? 'paper-fab' : 'paper-icon-button';

        return '<' + tagName + ' title="' + tooltip + '" data-itemid="' + itemId + '" icon="core:' + icon + '" class="' + btnCssClass + '" onclick="UserDataButtons.' + method + '(this);return false;"></' + tagName + '>';

    }

    function fill(options) {

        var html = getIconsHtml(options.item, options.includePlayed, options.buttonClass);

        options.element.innerHTML = html;
    }

    function getIconsHtml(item, includePlayed, cssClass) {

        var html = '';

        var userData = item.UserData || {};

        var itemId = item.Id;

        var btnCssClass = "btnUserData";

        if (cssClass) {
            btnCssClass += " " + cssClass;
        }

        if (includePlayed !== false) {
            var tooltipPlayed = Globalize.translate('core#TooltipPlayed');

            if (item.MediaType == 'Video' || item.Type == 'Series' || item.Type == 'Season' || item.Type == 'BoxSet' || item.Type == 'Playlist') {
                if (item.Type != 'TvChannel') {
                    if (userData.Played) {
                        html += getUserDataButtonHtml('markPlayed', itemId, btnCssClass + ' btnUserDataOn', 'check', tooltipPlayed);
                    } else {
                        html += getUserDataButtonHtml('markPlayed', itemId, btnCssClass + ' btnUserData', 'check', tooltipPlayed);
                    }
                }
            }
        }

        var tooltipLike = Globalize.translate('core#TooltipLike');
        var tooltipDislike = Globalize.translate('core#TooltipDislike');

        if (typeof userData.Likes == "undefined") {
            html += getUserDataButtonHtml('markDislike', itemId, btnCssClass + ' btnUserData btnDislike', 'thumb-down', tooltipDislike);
            html += getUserDataButtonHtml('markLike', itemId, btnCssClass + ' btnUserData btnLike', 'thumb-up', tooltipLike);
        }
        else if (userData.Likes) {
            html += getUserDataButtonHtml('markDislike', itemId, btnCssClass + ' btnUserData btnDislike', 'thumb-down', tooltipDislike);
            html += getUserDataButtonHtml('markLike', itemId, btnCssClass + ' btnUserData btnLike btnUserDataOn', 'thumb-up', tooltipLike);
        }
        else {
            html += getUserDataButtonHtml('markDislike', itemId, btnCssClass + ' btnUserData btnDislike btnUserDataOn', 'thumb-down', tooltipDislike);
            html += getUserDataButtonHtml('markLike', itemId, btnCssClass + ' btnUserData btnLike', 'thumb-up', tooltipLike);
        }

        var tooltipFavorite = Globalize.translate('core#TooltipFavorite');
        if (userData.IsFavorite) {

            html += getUserDataButtonHtml('markFavorite', itemId, btnCssClass + ' btnUserData btnUserDataOn', 'favorite', tooltipFavorite);
        } else {
            html += getUserDataButtonHtml('markFavorite', itemId, btnCssClass + ' btnUserData', 'favorite', tooltipFavorite);
        }

        return html;
    }

    function markFavorite(link) {

        var id = link.getAttribute('data-itemid');

        var markAsFavorite = !link.classList.contains('btnUserDataOn');

        Emby.Models.favorite(id, markAsFavorite);

        if (markAsFavorite) {
            link.classList.add('btnUserDataOn');
        } else {
            link.classList.remove('btnUserDataOn');
        }
    }

    function markLike(link) {

        var id = link.getAttribute('data-itemid');

        if (!link.classList.contains('btnUserDataOn')) {

            Emby.Models.likes(id, true);

            link.classList.add('btnUserDataOn');

        } else {

            Emby.Models.clearLike(id);

            link.classList.remove('btnUserDataOn');
        }

        link.parentNode.querySelector('.btnDislike').classList.remove('btnUserDataOn');
    }

    function markDislike(link) {

        var id = link.getAttribute('data-itemid');

        if (!link.classList.contains('btnUserDataOn')) {

            Emby.Models.likes(id, false);

            link.classList.add('btnUserDataOn');

        } else {

            Emby.Models.clearLike(id);

            link.classList.remove('btnUserDataOn');
        }

        link.parentNode.querySelector('.btnLike').classList.remove('btnUserDataOn');
    }

    function markPlayed(link) {

        var id = link.getAttribute('data-itemid');

        if (!link.classList.contains('btnUserDataOn')) {

            Emby.Models.played(id, true);

            link.classList.add('btnUserDataOn');

        } else {

            Emby.Models.played(id, false);

            link.classList.remove('btnUserDataOn');
        }
    }

    window.UserDataButtons = {
        markPlayed: markPlayed,
        markDislike: markDislike,
        markLike: markLike,
        markFavorite: markFavorite
    };

    return {
        fill: fill
    };

});
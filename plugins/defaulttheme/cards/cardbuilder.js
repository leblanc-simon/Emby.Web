(function (globalScope) {

    function getDisplayName(item, displayAsSpecial, includeParentInfo) {

        if (!item) {
            throw new Error("null item passed into getPosterViewDisplayName");
        }

        var name = item.EpisodeTitle || item.Name || '';

        if (item.Type == "TvChannel") {

            if (item.Number) {
                return item.Number + ' ' + name;
            }
            return name;
        }
        if (displayAsSpecial && item.Type == "Episode" && item.ParentIndexNumber == 0) {

            name = Globalize.translate('ValueSpecialEpisodeName', name);

        } else if (item.Type == "Episode" && item.IndexNumber != null && item.ParentIndexNumber != null) {

            var displayIndexNumber = item.IndexNumber;

            var number = "E" + displayIndexNumber;

            if (includeParentInfo !== false) {
                number = "S" + item.ParentIndexNumber + ", " + number;
            }

            if (item.IndexNumberEnd) {

                displayIndexNumber = item.IndexNumberEnd;
                number += "-" + displayIndexNumber;
            }

            name = number + " - " + name;

        }

        return name;
    }

    function setShapeHome(items, options) {

        var primaryImageAspectRatio = Emby.ImageLoader.getPrimaryImageAspectRatio(items) || 0;

        if (primaryImageAspectRatio && primaryImageAspectRatio < .85) {
            options.shape = 'portraitCard';
            options.rows = 2;
            options.width = DefaultTheme.CardBuilder.homePortraitWidth;
        }
        else if (primaryImageAspectRatio && primaryImageAspectRatio > 1.34) {
            options.shape = 'backdropCard';
            options.rows = 3;
            options.width = DefaultTheme.CardBuilder.homeThumbWidth;
        }
        else {
            options.shape = 'squareCard';
            options.rows = 3;
            options.width = DefaultTheme.CardBuilder.homeSquareWidth;
        }
    }

    function setShape(items, options) {

        var primaryImageAspectRatio = Emby.ImageLoader.getPrimaryImageAspectRatio(items) || 0;

        if (primaryImageAspectRatio && primaryImageAspectRatio < .85) {
            options.shape = 'portraitCard';
            options.width = 280;
        }
        else if (primaryImageAspectRatio && primaryImageAspectRatio > 1.34) {
            options.shape = 'backdropCard';
            options.width = 384;
        }
        else {
            options.shape = 'squareCard';
            options.width = 280;
        }
    }

    function buildCardsHtml(items, options) {

        return new Promise(function (resolve, reject) {

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                var html = buildCardsHtmlInternal(items, apiClient, options);

                resolve(html);
            });
        });
    }

    function buildCardsHtmlInternal(items, apiClient, options) {

        if (options.shape == 'autoHome') {
            setShapeHome(items, options);
        }
        else if (options.shape == 'autoVertical') {
            setShape(items, options);
        }
        else if (options.shape == 'auto') {
            setShapeHome(items, options);
        }

        if (options.indexBy == 'Genres') {
            return buildCardsByGenreHtmlInternal(items, apiClient, options);
        }

        var className = 'card';

        if (options.shape) {
            className += ' ' + options.shape;
        }

        var html = '';
        var itemsInRow = 0;

        var currentIndexValue;
        var hasOpenRow;
        var hasOpenSection;

        for (var i = 0, length = items.length; i < length; i++) {

            var item = items[i];

            if (options.indexBy) {
                var newIndexValue = '';

                if (options.indexBy == 'PremiereDate') {
                    if (item.PremiereDate) {
                        try {

                            newIndexValue = getDisplayDateText(Emby.DateTime.parseISO8601Date(item.PremiereDate));

                        } catch (err) {
                        }
                    }
                }

                else if (options.indexBy == 'Genres') {
                    newIndexValue = item.Name;
                }

                else if (options.indexBy == 'ProductionYear') {
                    newIndexValue = item.ProductionYear;
                }

                else if (options.indexBy == 'CommunityRating') {
                    newIndexValue = item.CommunityRating ? (Math.floor(item.CommunityRating) + (item.CommunityRating % 1 >= .5 ? .5 : 0)) + '+' : null;
                }

                if (newIndexValue != currentIndexValue) {

                    if (hasOpenRow) {
                        html += '</div>';
                        hasOpenRow = false;
                        itemsInRow = 0;
                    }

                    if (hasOpenSection) {
                        //html += '<paper-button>...</paper-button>';

                        html += '</div>';
                        hasOpenSection = false;
                    }

                    html += '<div class="horizontalSection">';
                    html += '<div class="sectionTitle">' + newIndexValue + '</div>';
                    currentIndexValue = newIndexValue;
                    hasOpenSection = true;
                }
            }

            if (options.rows && itemsInRow == 0) {

                if (hasOpenRow) {
                    html += '</div>';
                    hasOpenRow = false;
                }

                html += '<div class="cardColumn">';
                hasOpenRow = true;
            }

            var cardClass = className;
            html += buildCard(i, item, apiClient, options, cardClass);

            itemsInRow++;

            if (options.rows && itemsInRow >= options.rows) {
                html += '</div>';
                hasOpenRow = false;
                itemsInRow = 0;
            }
        }

        if (hasOpenRow) {
            html += '</div>';
        }

        if (hasOpenSection) {
            html += '</div>';
        }

        return html;
    }

    function buildCardsByGenreHtmlInternal(items, apiClient, options) {

        var className = 'card';

        if (options.shape) {
            className += ' ' + options.shape;
        }

        var html = '';

        var loopItems = options.genres;

        for (var i = 0, length = loopItems.length; i < length; i++) {

            var item = loopItems[i];

            html += '<div class="horizontalSection focuscontainer-down">';
            html += '<div class="sectionTitle">' + item.Name + '</div>';

            var genreLower = item.Name.toLowerCase();
            var renderItems = items.filter(function (currentItem) {

                return currentItem.Genres.filter(function (g) {

                    return g.toLowerCase() == genreLower;

                }).length > 0;
            });

            var showMoreButton = false;
            if (renderItems.length > options.indexLimit) {
                renderItems.length = Math.min(renderItems.length, options.indexLimit);
                showMoreButton = true;
            }

            var itemsInRow = 0;
            var hasOpenRow = false;
            var hasOpenSection = false;

            html += renderItems.map(function (renderItem) {

                var currentItemHtml = '';

                if (options.rows && itemsInRow == 0) {

                    if (hasOpenRow) {
                        currentItemHtml += '</div>';
                        hasOpenRow = false;
                    }

                    currentItemHtml += '<div class="cardColumn">';
                    hasOpenRow = true;
                }

                var cardClass = className;
                currentItemHtml += buildCard(i, renderItem, apiClient, options, cardClass);

                itemsInRow++;

                if (options.rows && itemsInRow >= options.rows) {
                    currentItemHtml += '</div>';
                    hasOpenRow = false;
                    itemsInRow = 0;
                }

                return currentItemHtml;

            }).join('');


            if (showMoreButton) {
                html += '<div class="listItemsMoreButtonContainer">';
                html += '<paper-button class="listItemsMoreButton" data-parentid="' + options.parentId + '" data-indextype="Genres" data-indexvalue="' + item.Id + '" raised>MORE</paper-button>';
                html += '</div>';
            }

            html += '</div>';
            html += '</div>';
        }

        return html;
    }

    function getDisplayDateText(date) {

        var weekday = [];
        weekday[0] = Globalize.translate('OptionSunday');
        weekday[1] = Globalize.translate('OptionMonday');
        weekday[2] = Globalize.translate('OptionTuesday');
        weekday[3] = Globalize.translate('OptionWednesday');
        weekday[4] = Globalize.translate('OptionThursday');
        weekday[5] = Globalize.translate('OptionFriday');
        weekday[6] = Globalize.translate('OptionSaturday');

        var day = weekday[date.getDay()];
        date = date.toLocaleDateString();

        if (date.toLowerCase().indexOf(day.toLowerCase()) == -1) {
            return day + " " + date;
        }

        return date;
    }

    function getCardImageUrl(item, apiClient, options) {

        var width = options.width;
        var height = null;
        var primaryImageAspectRatio = Emby.ImageLoader.getPrimaryImageAspectRatio([item]);
        var forceName = false;
        var imgUrl = null;
        var coverImage = false;

        if (options.preferThumb && item.ImageTags && item.ImageTags.Thumb) {

            imgUrl = apiClient.getScaledImageUrl(item.Id, {
                type: "Thumb",
                maxWidth: width,
                tag: item.ImageTags.Thumb
            });

        } else if (options.preferBanner && item.ImageTags && item.ImageTags.Banner) {

            imgUrl = apiClient.getScaledImageUrl(item.Id, {
                type: "Banner",
                maxWidth: width,
                tag: item.ImageTags.Banner
            });

        } else if (options.preferThumb && item.SeriesThumbImageTag && options.inheritThumb !== false) {

            imgUrl = apiClient.getScaledImageUrl(item.SeriesId, {
                type: "Thumb",
                maxWidth: width,
                tag: item.SeriesThumbImageTag
            });

        } else if (options.preferThumb && item.ParentThumbItemId && options.inheritThumb !== false) {

            imgUrl = apiClient.getThumbImageUrl(item.ParentThumbItemId, {
                type: "Thumb",
                maxWidth: width,
                tag: item.ParentThumbImageTag
            });

        } else if (options.preferThumb && item.BackdropImageTags && item.BackdropImageTags.length) {

            imgUrl = apiClient.getScaledImageUrl(item.Id, {
                type: "Backdrop",
                maxWidth: width,
                tag: item.BackdropImageTags[0]
            });

            forceName = true;

        } else if (item.ImageTags && item.ImageTags.Primary) {

            height = width && primaryImageAspectRatio ? Math.round(width / primaryImageAspectRatio) : null;

            imgUrl = apiClient.getImageUrl(item.Id, {
                type: "Primary",
                maxHeight: height,
                maxWidth: width,
                tag: item.ImageTags.Primary
            });

            if (options.preferThumb && options.showTitle !== false) {
                forceName = true;
            }

            coverImage = height != null;

        } else if (item.PrimaryImageTag) {

            height = width && primaryImageAspectRatio ? Math.round(width / primaryImageAspectRatio) : null;

            imgUrl = apiClient.getImageUrl(item.Id || item.ItemId, {
                type: "Primary",
                maxHeight: height,
                maxWidth: width,
                tag: item.PrimaryImageTag
            });

            if (options.preferThumb && options.showTitle !== false) {
                forceName = true;
            }
            coverImage = width != null;
        }
        else if (item.ParentPrimaryImageTag) {

            imgUrl = apiClient.getImageUrl(item.ParentPrimaryImageItemId, {
                type: "Primary",
                maxWidth: width,
                tag: item.ParentPrimaryImageTag
            });
        }
        else if (item.AlbumId && item.AlbumPrimaryImageTag) {

            width = primaryImageAspectRatio ? Math.round(height * primaryImageAspectRatio) : null;

            imgUrl = apiClient.getScaledImageUrl(item.AlbumId, {
                type: "Primary",
                maxHeight: height,
                maxWidth: width,
                tag: item.AlbumPrimaryImageTag
            });

            coverImage = width != null;
        }
        else if (item.Type == 'Season' && item.ImageTags && item.ImageTags.Thumb) {

            imgUrl = apiClient.getScaledImageUrl(item.Id, {
                type: "Thumb",
                maxWidth: width,
                tag: item.ImageTags.Thumb
            });

        }
        else if (item.BackdropImageTags && item.BackdropImageTags.length) {

            imgUrl = apiClient.getScaledImageUrl(item.Id, {
                type: "Backdrop",
                maxWidth: width,
                tag: item.BackdropImageTags[0]
            });

        } else if (item.ImageTags && item.ImageTags.Thumb) {

            imgUrl = apiClient.getScaledImageUrl(item.Id, {
                type: "Thumb",
                maxWidth: width,
                tag: item.ImageTags.Thumb
            });

        } else if (item.SeriesThumbImageTag) {

            imgUrl = apiClient.getScaledImageUrl(item.SeriesId, {
                type: "Thumb",
                maxWidth: width,
                tag: item.SeriesThumbImageTag
            });

        } else if (item.ParentThumbItemId) {

            imgUrl = apiClient.getThumbImageUrl(item.ParentThumbItemId, {
                type: "Thumb",
                maxWidth: width,
                tag: item.ParentThumbImageTag
            });

        }

        return {
            imgUrl: imgUrl,
            forceName: forceName,
            coverImage: coverImage
        };
    }

    function enableProgressIndicator(item) {

        if (item.MediaType == 'Video') {
            if (item.Type != 'TvChannel') {
                return true;
            }
        }

        return false;
    }

    function getProgressBarHtml(item) {

        if (enableProgressIndicator(item)) {
            if (item.Type == "Recording" && item.CompletionPercentage) {

                return '<paper-progress value="' + item.CompletionPercentage + '" class="block transparent"></paper-progress>';
            }

            var userData = item.UserData;
            if (userData) {
                var pct = userData.PlayedPercentage;

                if (pct && pct < 100) {

                    return '<paper-progress value="' + pct + '" class="block transparent"></paper-progress>';
                }
            }
        }

        return '';
    }

    function getCountIndicator(count) {

        return '<div class="cardCountIndicator">' + count + '</div>';
    }

    function getPlayedIndicator(item) {

        if (item.Type == "Series" || item.Type == "Season" || item.Type == "BoxSet" || item.MediaType == "Video" || item.MediaType == "Game" || item.MediaType == "Book") {

            var userData = item.UserData || {};

            if (userData.UnplayedItemCount) {
                return '<div class="cardCountIndicator">' + userData.UnplayedItemCount + '</div>';
            }

            if (item.Type != 'TvChannel') {
                if (userData.PlayedPercentage && userData.PlayedPercentage >= 100 || (userData.Played)) {
                    return '<div class="playedIndicator"><iron-icon icon="check"></iron-icon></div>';
                }
            }
        }

        return '';
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function buildCard(index, item, apiClient, options, className) {

        className += " itemAction";

        if (options.scalable) {
            className += " scalableCard";
        }

        var imgInfo = getCardImageUrl(item, apiClient, options);
        var imgUrl = imgInfo.imgUrl;

        var cardImageContainerClass = 'cardImageContainer';
        if (options.coverImage || imgInfo.coverImage) {
            cardImageContainerClass += ' coveredImage';
        }

        if (!imgUrl) {
            cardImageContainerClass += ' emptyCardImageContainer defaultCardColor' + getRandomInt(1, 5);
        }

        var separateCardBox = options.scalable;

        if (!separateCardBox) {
            cardImageContainerClass += " cardBox";
        }

        // cardBox can be it's own separate element if an outer footer is ever needed
        var cardImageContainerOpen = imgUrl ? ('<div class="' + cardImageContainerClass + ' lazy" data-src="' + imgUrl + '">') : ('<div class="' + cardImageContainerClass + '">');
        var cardImageContainerClose = '</div>';

        if (separateCardBox) {
            cardImageContainerOpen = '<div class="cardBox"><div class="cardScalable"><div class="cardPadder"></div><div class="cardContent">' + cardImageContainerOpen;
            cardImageContainerClose += '</div></div></div>';
        }

        if (options.showGroupCount) {

            if (item.ChildCount && item.ChildCount > 1) {
                cardImageContainerOpen += getCountIndicator(item.ChildCount);
            }
        }
        else {
            cardImageContainerOpen += getPlayedIndicator(item);
        }

        var showTitle = options.showTitle || imgInfo.forceName;

        if (!imgUrl) {
            cardImageContainerOpen += '<div class="cardText cardCenteredText">' + getDisplayName(item) + '</div>';
        }

        var nameHtml = '';

        if (options.showParentTitle) {
            nameHtml += '<div class="cardText">' + (item.EpisodeTitle ? item.Name : (item.SeriesName || item.Album || item.AlbumArtist || item.GameSystem || "")) + '</div>';
        }

        if (showTitle) {
            var nameClass = 'cardText';
            nameHtml += '<div class="' + nameClass + '">' + getDisplayName(item) + '</div>';
        }

        var innerCardFooterClass = 'innerCardFooter';
        var progressHtml = getProgressBarHtml(item);

        if (progressHtml) {
            nameHtml += progressHtml;
            innerCardFooterClass += " fullInnerCardFooter";
        }

        var innerCardFooter = '';

        if (nameHtml && imgUrl) {
            innerCardFooter += '<div class="' + innerCardFooterClass + '">';
            innerCardFooter += nameHtml;
            innerCardFooter += '</div>';
        }

        var data = '';

        if (options.addImageData) {
            var primaryImageTag = (item.ImageTags || {}).Primary || item.PrimaryImageTag || '';
            data += '<input type="hidden" class="primaryImageTag" value="' + primaryImageTag + '" />';
        }

        var action = options.action || 'link';

        var tagName = 'button';

        var prefix = (item.SortName || item.Name || '')[0];

        if (prefix) {
            prefix = prefix.toUpperCase();
        }

        return '\
<' + tagName + ' data-index="' + index + '" data-action="' + action + '" data-isfolder="' + (item.IsFolder || false) + '" data-id="' + (item.Id || item.ItemId) + '" data-type="' + item.Type + '" data-prefix="' + prefix + '" raised class="' + className + '"> \
' + cardImageContainerOpen + innerCardFooter + data + cardImageContainerClose + '\
</' + tagName + '>';
    }

    function buildCards(items, options) {

        // Abort if the container has been disposed
        if (!Emby.Dom.isInDocument(options.itemsContainer)) {
            return;
        }

        if (options.parentContainer) {
            if (items.length) {
                options.parentContainer.classList.remove('hide');
            } else {
                options.parentContainer.classList.add('hide');
                return;
            }
        }

        require(['connectionManager'], function (connectionManager) {

            var apiClient = connectionManager.currentApiClient();

            var html = buildCardsHtmlInternal(items, apiClient, options);

            options.itemsContainer.innerHTML = html;

            Emby.ImageLoader.lazyChildren(options.itemsContainer);

            if (options.autoFocus) {
                Emby.FocusManager.autoFocus(options.itemsContainer, true);
            }

            if (options.indexBy == 'Genres') {
                options.itemsContainer.addEventListener('click', onItemsContainerClick);
            }
        });
    }

    function onItemsContainerClick(e) {

        var listItemsMoreButton = Emby.Dom.parentWithClass(e.target, 'listItemsMoreButton');

        if (listItemsMoreButton) {

            var value = listItemsMoreButton.getAttribute('data-indexvalue');
            var parentid = listItemsMoreButton.getAttribute('data-parentid');

            Emby.Page.show(Emby.PluginManager.mapPath('defaulttheme', 'list/list.html') + '?parentid=' + parentid + '&genreId=' + value);
        }
    }

    function getMediaInfoHtml(item) {
        var html = '';

        var miscInfo = [];

        var text, date, minutes;

        if (item.Type == "MusicAlbum" || item.MediaType == 'MusicArtist' || item.MediaType == 'Playlist' || item.MediaType == 'MusicGenre') {

            var count = item.SongCount || item.ChildCount;

            if (count) {

                miscInfo.push(Globalize.translate('TrackCount', count));
            }

            if (item.CumulativeRunTimeTicks) {

                miscInfo.push(getDisplayRuntime(item.CumulativeRunTimeTicks));
            }
        }

        if (item.Type == "Episode" || item.MediaType == 'Photo') {

            if (item.PremiereDate) {

                try {
                    date = Emby.DateTime.parseISO8601Date(item.PremiereDate);

                    text = date.toLocaleDateString();
                    miscInfo.push(text);
                }
                catch (e) {
                    Logger.log("Error parsing date: " + item.PremiereDate);
                }
            }
        }

        if (item.StartDate) {

            try {
                date = Emby.DateTime.parseISO8601Date(item.StartDate);

                text = date.toLocaleDateString();
                miscInfo.push(text);

                if (item.Type != "Recording") {
                    text = getDisplayTime(date);
                    miscInfo.push(text);
                }
            }
            catch (e) {
                Logger.log("Error parsing date: " + item.PremiereDate);
            }
        }

        if (item.ProductionYear && item.Type == "Series") {

            if (item.Status == "Continuing") {
                miscInfo.push(Globalize.translate('ValueSeriesYearToPresent', item.ProductionYear));

            }
            else if (item.ProductionYear) {

                text = item.ProductionYear;

                if (item.EndDate) {

                    try {

                        var endYear = Emby.DateTime.parseISO8601Date(item.EndDate).getFullYear();

                        if (endYear != item.ProductionYear) {
                            text += "-" + Emby.DateTime.parseISO8601Date(item.EndDate).getFullYear();
                        }

                    }
                    catch (e) {
                        Logger.log("Error parsing date: " + item.EndDate);
                    }
                }

                miscInfo.push(text);
            }
        }

        if (item.Type != "Series" && item.Type != "Episode" && item.Type != "Person" && item.MediaType != 'Photo') {

            if (item.ProductionYear) {

                miscInfo.push(item.ProductionYear);
            }
            else if (item.PremiereDate) {

                try {
                    text = Emby.DateTime.parseISO8601Date(item.PremiereDate).getFullYear();
                    miscInfo.push(text);
                }
                catch (e) {
                    Logger.log("Error parsing date: " + item.PremiereDate);
                }
            }
        }

        if (item.RunTimeTicks && item.Type != "Series") {

            if (item.Type == "Audio") {

                miscInfo.push(getDisplayRuntime(item.RunTimeTicks));

            } else {
                minutes = item.RunTimeTicks / 600000000;

                minutes = minutes || 1;

                miscInfo.push(Math.round(minutes) + " mins");
            }
        }

        if (item.OfficialRating && item.Type !== "Season" && item.Type !== "Episode") {
            miscInfo.push({
                text: item.OfficialRating,
                cssClass: 'mediaInfoOfficialRating'
            });
        }

        if (item.HasSubtitles) {
            miscInfo.push({
                html: '<iron-icon class="mediaInfoItem closedCaptionIcon" icon="closed-caption"></iron-icon>'
            });
        }

        if (item.Video3DFormat) {
            miscInfo.push("3D");
        }

        if (item.MediaType == 'Photo' && item.Width && item.Height) {
            miscInfo.push(item.Width + "x" + item.Height);
        }

        html += miscInfo.map(function (m) {

            var cssClass = "mediaInfoItem";
            var mediaInfoText = m;

            if (typeof (m) !== 'string' && typeof (m) !== 'number') {

                if (m.html) {
                    return m.html;
                }
                mediaInfoText = m.text;
                cssClass += ' ' + m.cssClass;
            }
            return '<div class="' + cssClass + '">' + mediaInfoText + '</div>';

        }).join('');

        html += getStarIconsHtml(item);

        if (item.CriticRating) {

            if (item.CriticRating >= 60) {
                html += '<div class="mediaInfoItem criticRating criticRatingFresh">' + item.CriticRating + '</div>';
            } else {
                html += '<div class="mediaInfoItem criticRating criticRatingRotten">' + item.CriticRating + '</div>';
            }
        }

        return html;
    }

    function getDisplayRuntime(ticks) {

        var ticksPerHour = 36000000000;
        var ticksPerMinute = 600000000;
        var ticksPerSecond = 10000000;

        var parts = [];

        var hours = ticks / ticksPerHour;
        hours = Math.floor(hours);

        if (hours) {
            parts.push(hours);
        }

        ticks -= (hours * ticksPerHour);

        var minutes = ticks / ticksPerMinute;
        minutes = Math.floor(minutes);

        ticks -= (minutes * ticksPerMinute);

        if (minutes < 10 && hours) {
            minutes = '0' + minutes;
        }
        parts.push(minutes);

        var seconds = ticks / ticksPerSecond;
        seconds = Math.floor(seconds);

        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        parts.push(seconds);

        return parts.join(':');
    }

    function getStarIconsHtml(item) {

        var html = '';

        var rating = item.CommunityRating;

        if (rating) {
            html += '<div class="starRatingContainer mediaInfoItem">';

            for (var i = 0; i < 5; i++) {
                var starValue = (i + 1) * 2;

                if (rating < starValue - 2) {
                    html += '<iron-icon icon="star" class="emptyStar"></iron-icon>';
                }
                else if (rating < starValue) {
                    html += '<iron-icon icon="star-half"></iron-icon>';
                }
                else {
                    html += '<iron-icon icon="star"></iron-icon>';
                }
            }

            html += '</div>';
        }

        return html;
    }

    function getListViewHtml(items, options) {

        var outerHtml = "";

        var index = 0;
        var groupTitle = '';
        var action = options.action || 'link';

        var isLargeStyle = options.imageSize == 'large';

        outerHtml += items.map(function (item) {

            var html = '';

            var cssClass = "itemAction";

            var downloadWidth = 80;

            if (isLargeStyle) {
                cssClass += " largeImage";
                downloadWidth = 500;
            }

            html += '<paper-icon-item class="' + cssClass + '" data-index="' + index + '" data-action="' + action + '" data-isfolder="' + item.IsFolder + '" data-id="' + item.Id + '" data-type="' + item.Type + '">';

            var imgUrl = Emby.Models.imageUrl(item, {
                width: downloadWidth,
                type: "Primary"
            });

            if (!imgUrl) {
                imgUrl = Emby.Models.thumbImageUrl(item, {
                    width: downloadWidth,
                    type: "Thumb"
                });
            }

            if (imgUrl) {
                html += '<div class="paperIconItemImage lazy" data-src="' + imgUrl + '" item-icon>';
            } else {
                html += '<div class="paperIconItemImage" item-icon>';
            }
            html += getPlayedIndicator(item);
            var progressHtml = getProgressBarHtml(item);

            if (progressHtml) {
                html += progressHtml;
            }
            html += '</div>';

            var textlines = [];

            if (options.showParentTitle) {
                if (item.Type == 'Episode') {
                    textlines.push(item.SeriesName || '&nbsp;');
                } else if (item.Type == 'MusicAlbum') {
                    textlines.push(item.AlbumArtist || '&nbsp;');
                }
            }

            var displayName = getDisplayName(item);

            if (options.showIndexNumber && item.IndexNumber != null) {
                displayName = item.IndexNumber + ". " + displayName;
            }
            textlines.push(displayName);

            if (item.Type == 'Audio') {
                textlines.push(item.ArtistItems.map(function (a) {
                    return a.Name;

                }).join(', ') || '&nbsp;');
            }

            var lineCount = textlines.length;
            if (!options.enableSideMediaInfo) {
                lineCount++;
            }
            if (options.enableOverview && item.Overview) {
                lineCount++;
            }

            if (lineCount > 2) {
                html += '<paper-item-body three-line>';
            } else if (lineCount > 1) {
                html += '<paper-item-body two-line>';
            } else {
                html += '<paper-item-body>';
            }

            for (var i = 0, textLinesLength = textlines.length; i < textLinesLength; i++) {

                if (i == 0 && isLargeStyle) {
                    html += '<h2 class="listItemTitle">';
                }
                else if (i == 0) {
                    html += '<div>';
                } else {
                    html += '<div secondary>';
                }
                html += textlines[i] || '&nbsp;';
                if (i == 0 && isLargeStyle) {
                    html += '</h2>';
                } else {
                    html += '</div>';
                }
            }

            if (!options.enableSideMediaInfo) {
                html += '<div class="paperIconItemMediaInfo">' + getMediaInfoHtml(item) + '</div>';
            }

            if (options.enableOverview && item.Overview) {
                html += '<div secondary class="overview">';
                html += item.Overview;
                html += '</div>';
            }

            html += '</paper-item-body>';

            if (options.enableSideMediaInfo) {
                html += '<div class="paperIconItemMediaInfo">' + getMediaInfoHtml(item) + '</div>';
            }

            html += '</paper-icon-item>';

            index++;
            return html;

        }).join('');

        return outerHtml;
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.CardBuilder = {
        buildCardsHtml: buildCardsHtml,
        buildCards: buildCards,
        homeThumbWidth: 320,
        homePortraitWidth: 189,
        homeSquareWidth: 180,
        getDisplayName: getDisplayName,
        getMediaInfoHtml: getMediaInfoHtml,
        getListViewHtml: getListViewHtml,
        getProgressBarHtml: getProgressBarHtml
    };

})(this);
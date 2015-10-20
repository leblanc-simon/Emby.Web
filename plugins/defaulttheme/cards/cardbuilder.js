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

        var className = 'card';

        if (options.shape == 'autoHome') {
            setShapeHome(items, options);
        }
        else if (options.shape == 'autoVertical') {
            setShape(items, options);
        }
        else if (options.shape == 'auto') {
            setShapeHome(items, options);
        }

        if (options.shape) {
            className += ' ' + options.shape;
        }

        var html = '';
        var itemsInRow = 0;

        for (var i = 0, length = items.length; i < length; i++) {

            if (options.rows && itemsInRow == 0) {
                html += '<div class="cardColumn">';
            }

            var item = items[i];

            html += buildCard(i, item, apiClient, options, className);

            itemsInRow++;

            if (options.rows && itemsInRow >= options.rows) {
                itemsInRow = 0;
                html += '</div>';
            }
        }

        return html;
    }

    function getCardImageUrl(item, apiClient, options) {

        var width = options.width;
        var height = null;
        var primaryImageAspectRatio = Emby.ImageLoader.getPrimaryImageAspectRatio([item]);
        var forceName = false;
        var imgUrl = null;

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
                maxWidth: width
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
                height: height,
                width: width,
                tag: item.ImageTags.Primary
            });

            if (options.preferThumb && options.showTitle !== false) {
                forceName = true;
            }
        }
        else if (item.ParentPrimaryImageTag) {

            imgUrl = apiClient.getImageUrl(item.ParentPrimaryImageItemId, {
                type: "Primary",
                width: width,
                tag: item.ParentPrimaryImageTag
            });
        }
        else if (item.AlbumId && item.AlbumPrimaryImageTag) {

            width = primaryImageAspectRatio ? Math.round(height * primaryImageAspectRatio) : null;

            imgUrl = apiClient.getScaledImageUrl(item.AlbumId, {
                type: "Primary",
                height: height,
                width: width,
                tag: item.AlbumPrimaryImageTag
            });

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

            imgUrl = apiClient.getThumbImageUrl(item, {
                type: "Thumb",
                maxWidth: width
            });

        }

        return {
            imgUrl: imgUrl,
            forceName: forceName
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

                return '<paper-progress value="' + item.CompletionPercentage + '" class="block"></paper-progress>';
            }

            var userData = item.UserData;
            if (userData) {
                var pct = userData.PlayedPercentage;

                if (pct && pct < 100) {

                    return '<paper-progress value="' + pct + '" class="block"></paper-progress>';
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
            if (item.UserData.UnplayedItemCount) {
                return '<div class="cardCountIndicator">' + item.UserData.UnplayedItemCount + '</div>';
            }

            if (item.Type != 'TvChannel') {
                if (item.UserData.PlayedPercentage && item.UserData.PlayedPercentage >= 100 || (item.UserData && item.UserData.Played)) {
                    return '<div class="playedIndicator"><iron-icon icon="check"></iron-icon></div>';
                }
            }
        }

        return '';
    }

    function buildCard(index, item, apiClient, options, className) {

        className += " itemAction";

        if (options.scalable) {
            className += " scalableCard";
        }

        var imgInfo = getCardImageUrl(item, apiClient, options);
        var imgUrl = imgInfo.imgUrl;

        var cardImageContainerClass = 'cardImageContainer';
        if (options.coverImage) {
            cardImageContainerClass += ' coveredImage';
        }

        if (!imgUrl) {
            cardImageContainerClass += ' emptyCardImageContainer';
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
            if (options.showTitle && options.hiddenTitle) {
                nameClass += ' hide hiddenTitle';
            }
            nameHtml += '<div class="' + nameClass + '">' + getDisplayName(item) + '</div>';
        }

        var innerCardFooterClass = 'innerCardFooter';
        var progressHtml = getProgressBarHtml(item);

        if (progressHtml) {
            nameHtml += progressHtml;
            innerCardFooterClass += " fullInnerCardFooter";
        }

        var innerCardFooter = '';

        if (nameHtml) {
            innerCardFooter += '<div class="' + innerCardFooterClass + '">';
            innerCardFooter += nameHtml;
            innerCardFooter += '</div>';
        }

        var data = '';

        if (options.addImageData) {
            var primaryImageTag = (item.ImageTags || {}).Primary || '';
            data += '<input type="hidden" class="primaryImageTag" value="' + primaryImageTag + '" />';
        }

        var action = options.action || 'link';

        var tagName = Emby.Dom.supportsWebComponents() ? 'paper-button' : 'button';

        return '\
<' + tagName + ' data-index="' + index + '" data-action="' + action + '" data-isfolder="' + item.IsFolder + '" data-id="' + item.Id + '" data-type="' + item.Type + '" raised class="' + className + '"> \
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
        });
    }

    function getMediaInfoHtml(item) {
        var html = '';

        html += getStarIconsHtml(item);

        if (item.CriticRating) {

            if (item.CriticRating >= 60) {
                html += '<div class="mediaInfoItem criticRatingFresh">' + item.CriticRating + '</div>';
            } else {
                html += '<div class="mediaInfoItem criticRatingRotten">' + item.CriticRating + '</div>';
            }
        }

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

        if (item.Type != "Series" && item.Type != "Episode" && item.MediaType != 'Photo') {

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
            miscInfo.push(item.OfficialRating);
        }

        if (item.Video3DFormat) {
            miscInfo.push("3D");
        }

        if (item.MediaType == 'Photo' && item.Width && item.Height) {
            miscInfo.push(item.Width + "x" + item.Height);
        }

        html += miscInfo.map(function (m) {

            return '<div class="mediaInfoItem">' + m + '</div>';

        }).join('');

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
            html += '<div class="starRatingContainer">';

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

        outerHtml += items.map(function (item) {

            var html = '';

            var cssClass = "itemAction";

            var downloadWidth = 80;

            if (options.imageSize == 'large') {
                cssClass += " largeImage";
                downloadWidth = 500;
            }

            html += '<paper-icon-item class="' + cssClass + '" data-index="' + index + '" data-action="' + action + '" data-isfolder="' + item.IsFolder + '" data-id="' + item.Id + '" data-type="' + item.Type + '">';

            // Scaling 400w episode images to 80 doesn't turn out very well
            var minScale = item.Type == 'Episode' || item.Type == 'Game' ? 2 : 1.5;

            var imgUrl = Emby.Models.imageUrl(item, {
                width: downloadWidth,
                type: "Primary",
                minScale: minScale
            });

            if (!imgUrl) {
                imgUrl = Emby.Models.thumbImageUrl(item, {
                    width: downloadWidth,
                    type: "Thumb",
                    minScale: minScale
                });
            }

            if (imgUrl) {
                html += '<div class="paperIconItemImage lazy" data-src="' + imgUrl + '" item-icon></div>';
            } else {
                html += '<div class="paperIconItemImage" item-icon></div>';
            }

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

                if (i == 0) {
                    html += '<div>';
                } else {
                    html += '<div secondary>';
                }
                html += textlines[i] || '&nbsp;';
                html += '</div>';
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
        getListViewHtml: getListViewHtml
    };

})(this);
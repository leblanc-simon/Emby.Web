define(['datetime', 'coreIcons'], function (datetime) {

    function getMediaInfoHtml(item, options) {
        var html = '';

        var miscInfo = [];
        options = options || {};
        var text, date, minutes;

        if (item.Type == "MusicAlbum" || item.MediaType == 'MusicArtist' || item.MediaType == 'Playlist' || item.MediaType == 'MusicGenre') {

            var count = item.SongCount || item.ChildCount;

            if (count) {

                miscInfo.push(Globalize.translate('core#TrackCount', count));
            }

            if (item.CumulativeRunTimeTicks) {

                miscInfo.push(datetime.getDisplayRunningTime(item.CumulativeRunTimeTicks));
            }
        }

        else if (item.Type == "PhotoAlbum" || item.Type == "BoxSet") {

            var count = item.ChildCount;

            if (count) {

                miscInfo.push(Globalize.translate('core#ItemCount', count));
            }
        }

        if (item.Type == "Episode" || item.MediaType == 'Photo') {

            if (item.PremiereDate) {

                try {
                    date = datetime.parseISO8601Date(item.PremiereDate);

                    text = date.toLocaleDateString();
                    miscInfo.push(text);
                }
                catch (e) {
                    console.log("Error parsing date: " + item.PremiereDate);
                }
            }
        }

        if (item.StartDate) {

            try {
                date = datetime.parseISO8601Date(item.StartDate);

                text = date.toLocaleDateString();
                miscInfo.push(text);

                if (item.Type != "Recording") {
                    text = getDisplayTime(date);
                    miscInfo.push(text);
                }
            }
            catch (e) {
                console.log("Error parsing date: " + item.PremiereDate);
            }
        }

        if (item.ProductionYear && item.Type == "Series") {

            if (item.Status == "Continuing") {
                miscInfo.push(Globalize.translate('core#ValueSeriesYearToPresent', item.ProductionYear));

            }
            else if (item.ProductionYear) {

                text = item.ProductionYear;

                if (item.EndDate) {

                    try {

                        var endYear = datetime.parseISO8601Date(item.EndDate).getFullYear();

                        if (endYear != item.ProductionYear) {
                            text += "-" + datetime.parseISO8601Date(item.EndDate).getFullYear();
                        }

                    }
                    catch (e) {
                        console.log("Error parsing date: " + item.EndDate);
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
                    text = datetime.parseISO8601Date(item.PremiereDate).getFullYear();
                    miscInfo.push(text);
                }
                catch (e) {
                    console.log("Error parsing date: " + item.PremiereDate);
                }
            }
        }

        if (item.RunTimeTicks && item.Type != "Series" && options.runtime !== false) {

            if (item.Type == "Audio") {

                miscInfo.push(datetime.getDisplayRunningTime(item.RunTimeTicks));

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

        if (item.HasSubtitles && options.subtitles !== false) {
            miscInfo.push({
                html: '<iron-icon class="mediaInfoItem closedCaptionIcon" icon="core:closed-caption"></iron-icon>'
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

        if (item.CriticRating && options.criticRating !== false) {

            if (item.CriticRating >= 60) {
                html += '<div class="mediaInfoItem criticRating criticRatingFresh">' + item.CriticRating + '</div>';
            } else {
                html += '<div class="mediaInfoItem criticRating criticRatingRotten">' + item.CriticRating + '</div>';
            }
        }

        return html;
    }

    function getStarIconsHtml(item) {

        var html = '';

        var rating = item.CommunityRating;

        if (rating) {
            html += '<div class="starRatingContainer mediaInfoItem">';

            for (var i = 0; i < 5; i++) {
                var starValue = (i + 1) * 2;

                if (rating < starValue - 2) {
                    html += '<iron-icon icon="core:star" class="emptyStar"></iron-icon>';
                }
                else if (rating < starValue) {
                    html += '<iron-icon icon="core:star-half"></iron-icon>';
                }
                else {
                    html += '<iron-icon icon="core:star"></iron-icon>';
                }
            }

            html += '</div>';
        }

        return html;
    }

    function getDisplayName(item, options) {

        if (!item) {
            throw new Error("null item passed into getDisplayName");
        }

        options = options || {};

        var name = item.EpisodeTitle || item.Name || '';

        if (item.Type == "TvChannel") {

            if (item.Number) {
                return item.Number + ' ' + name;
            }
            return name;
        }
        if (options.isInlineSpecial && item.Type == "Episode" && item.ParentIndexNumber == 0) {

            name = Globalize.translate('core#ValueSpecialEpisodeName', name);

        } else if (item.Type == "Episode" && item.IndexNumber != null && item.ParentIndexNumber != null) {

            var displayIndexNumber = item.IndexNumber;

            var number = "E" + displayIndexNumber;

            if (options.includeParentInfo !== false) {
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

    return {
        getMediaInfoHtml: getMediaInfoHtml
    };
});
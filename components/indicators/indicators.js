define(['paper-progress', 'css!./indicators.css'], function () {

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

                return '<paper-progress class="itemProgress" value="' + item.CompletionPercentage + '"></paper-progress>';
            }

            var userData = item.UserData;
            if (userData) {
                var pct = userData.PlayedPercentage;

                if (pct && pct < 100) {

                    return '<paper-progress class="itemProgress" value="' + pct + '"></paper-progress>';
                }
            }
        }

        return '';
    }

    function enablePlayedIndicator(item) {

        if (item.Type == "Series" || item.Type == "Season" || item.Type == "BoxSet" || item.MediaType == "Video" || item.MediaType == "Game" || item.MediaType == "Book") {

            if (item.Type != 'TvChannel') {
                return true;
            }
        }

        return false;
    }

    function getPlayedIndicator(item) {

        if (enablePlayedIndicator(item)) {

            var userData = item.UserData || {};

            if (userData.UnplayedItemCount) {
                return '<div class="countIndicator">' + userData.UnplayedItemCount + '</div>';
            }

            if (userData.PlayedPercentage && userData.PlayedPercentage >= 100 || (userData.Played)) {
                return '<div class="playedIndicator"><iron-icon icon="check"></iron-icon></div>';
            }
        }

        return '';
    }

    function getCountIndicatorHtml(count) {

        return '<div class="countIndicator">' + count + '</div>';
    }

    function getChildCountIndicatorHtml(item, options) {

        var minCount = 0;
       
        if (options) {
            minCount = options.minCount || minCount;
        }

        if (item.ChildCount && item.ChildCount > minCount) {
            return getCountIndicatorHtml(item.ChildCount);
        }

        return '';
    }

    return {
        getProgressBarHtml: getProgressBarHtml,
        getPlayedIndicatorHtml: getPlayedIndicator,
        getChildCountIndicatorHtml: getChildCountIndicatorHtml,
        enableProgressIndicator: enableProgressIndicator,
        enablePlayedIndicator: enablePlayedIndicator
    };
});
(function (globalScope) {

    function buildChapterCardsHtml(chapters, options) {

        var className = 'card scalableCard';

        if (options.shape) {
            className += ' ' + options.shape;
        }

        if (options.block || options.rows) {
            className += ' block';
        }

        var html = '';
        var itemsInRow = 0;

        for (var i = 0, length = chapters.length; i < length; i++) {

            if (options.rows && itemsInRow == 0) {
                html += '<div class="cardColumn">';
            }

            var chapter = chapters[i];

            html += buildChapterCard(chapter, options, className);
            itemsInRow++;

            if (options.rows && itemsInRow >= options.rows) {
                itemsInRow = 0;
                html += '</div>';
            }
        }

        return html;
    }

    function buildChapterCard(chapter, options, className) {

        var imgUrl = chapter.images ? chapter.images.primary : '';

        var cardImageContainerClass = 'cardImageContainer';
        if (options.coverImage) {
            cardImageContainerClass += ' coveredImage';
        }
        var cardImageContainer = imgUrl ? ('<div class="' + cardImageContainerClass + ' lazy" data-src="' + imgUrl + '">') : ('<div class="' + cardImageContainerClass + '">');

        var nameHtml = '';
        nameHtml += '<div class="cardText">' + chapter.Name + '</div>';

        var html = '\
<button type="button" class="' + className + '"> \
<div class="cardBox">\
<div class="cardScalable">\
<div class="cardPadder"></div>\
<div class="cardContent">\
' + cardImageContainer + '\
</div>\
<div class="innerCardFooter">\
' + nameHtml + '\
</div>\
</div>\
</div>\
</div>\
</button>'
        ;

        return html;
    }

    function buildChapterCards(items, options) {

        // Abort if the container has been disposed
        if (!Emby.Dom.isInDocument(options.parentContainer)) {
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

        var html = buildChapterCardsHtml(items, options);

        options.itemsContainer.innerHTML = html;

        Emby.ImageLoader.lazyChildren(options.itemsContainer);
    }

    if (!globalScope.DefaultTheme) {
        globalScope.DefaultTheme = {};
    }

    globalScope.DefaultTheme.ChapterCardBuilder = {
        buildChapterCards: buildChapterCards
    };

})(this);
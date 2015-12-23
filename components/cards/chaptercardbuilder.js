define([], function () {

    function buildChapterCardsHtml(item, chapters, options) {

        var className = 'card scalableCard itemAction backdropCard';

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

            html += buildChapterCard(item, chapter, options, className);
            itemsInRow++;

            if (options.rows && itemsInRow >= options.rows) {
                itemsInRow = 0;
                html += '</div>';
            }
        }

        return html;
    }

    function buildChapterCard(item, chapter, options, className) {

        var imgUrl = chapter.images ? chapter.images.primary : '';

        var cardImageContainerClass = 'cardImageContainer';
        if (options.coverImage) {
            cardImageContainerClass += ' coveredImage';
        }
        var dataAttributes = ' data-action="play" data-isfolder="' + item.IsFolder + '" data-id="' + item.Id + '" data-type="' + item.Type + '" data-startpositionticks="' + chapter.StartPositionTicks + '"';
        var cardImageContainer = imgUrl ? ('<div class="' + cardImageContainerClass + ' lazy" data-src="' + imgUrl + '">') : ('<div class="' + cardImageContainerClass + '">');

        var nameHtml = '';
        nameHtml += '<div class="cardText">' + chapter.Name + '</div>';

        var html = '\
<button type="button" class="' + className + '"' + dataAttributes + '> \
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

    function buildChapterCards(item, chapters, options) {

        // Abort if the container has been disposed
        if (!Emby.Dom.isInDocument(options.parentContainer)) {
            return;
        }

        if (options.parentContainer) {
            if (chapters.length) {
                options.parentContainer.classList.remove('hide');
            } else {
                options.parentContainer.classList.add('hide');
                return;
            }
        }

        var html = buildChapterCardsHtml(item, chapters, options);

        options.itemsContainer.innerHTML = html;

        Emby.ImageLoader.lazyChildren(options.itemsContainer);
    }

    return {
        buildChapterCards: buildChapterCards
    };

});
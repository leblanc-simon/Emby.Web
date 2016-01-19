define(['playbackManager'], function (playbackManager) {

    function playAllFromHere(card) {
        var cards = card.parentNode.querySelectorAll('.itemAction[data-id]');
        var ids = [];

        var foundCard = false;
        for (var i = 0, length = cards.length; i < length; i++) {
            if (cards[i] == card) {
                foundCard = true;
            }
            if (foundCard) {
                ids.push(cards[i].getAttribute('data-id'));
            }
        }
        playbackManager.play({
            ids: ids
        });
    }

    // Add some shortcuts
    document.addEventListener('click', function (e) {

        var card = Emby.Dom.parentWithClass(e.target, 'itemAction');

        if (card) {
            var action = card.getAttribute('data-action');

            if (action) {

                var id = card.getAttribute('data-id');
                var type = card.getAttribute('data-type');
                var isfolder = card.getAttribute('data-isfolder') == 'true';

                if (action == 'link') {
                    Emby.Page.showItem({
                        Id: id,
                        Type: type,
                        IsFolder: isfolder
                    });
                }

                else if (action == 'instantmix') {
                    playbackManager.instantMix(id);
                }

                else if (action == 'play') {

                    var startPositionTicks = parseInt(card.getAttribute('data-startpositionticks') || '0');

                    playbackManager.play({
                        ids: [id],
                        startPositionTicks: startPositionTicks
                    });
                }

                else if (action == 'playallfromhere') {
                    playAllFromHere(card);
                }

                else if (action == 'setplaylistindex') {

                }
            }
        }
    });


});
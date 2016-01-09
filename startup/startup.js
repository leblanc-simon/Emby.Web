(function (document) {

    document.addEventListener("viewshow-welcome", function (e) {

        var element = e.target;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        Emby.Page.setTitle(null);
        Emby.Backdrop.clear();

        require(['loading'], function (loading) {
            loading.hide();
        });

        if (!isRestored) {
            element.querySelector('.btnWelcomeNext').addEventListener('click', function () {

                require(['loading', 'connectionManager'], function (loading, connectionManager) {
                    connectionManager.connect().then(function (result) {

                        loading.hide();

                        handleConnectionResult(result, element);
                    });
                });
            });
        }
    });

    document.addEventListener("viewshow-manuallogin", function (e) {

        var element = e.target;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        Emby.Page.setTitle(null);
        Emby.Backdrop.clear();

        element.querySelector('.txtUserName').value = params.user || '';
        element.querySelector('.txtPassword').value = '';

        if (params.user) {
            Emby.FocusManager.focus(element.querySelector('.txtPassword'));
        } else {
            Emby.FocusManager.focus(element.querySelector('.txtUserName'));
        }

        if (!isRestored) {
            element.querySelector('form').addEventListener('submit', function (e) {

                var username = this.querySelector('.txtUserName').value;
                var password = this.querySelector('.txtPassword').value;

                require(['connectionManager', 'loading'], function (connectionManager, loading) {

                    loading.show();

                    var serverId = params.serverid;

                    authenticateUser(element, serverId, username, password);
                });

                e.preventDefault();
                return false;
            });

            element.querySelector('.buttonCancel').addEventListener('click', function (e) {

                Emby.Page.back();
            });

            var paperSubmit = element.querySelector('.paperSubmit');
            if (paperSubmit) {
                // This element won't be here in the lite version
                paperSubmit.addEventListener('click', function (e) {

                    // Do a fake form submit this the button isn't a real submit button
                    var fakeSubmit = document.createElement('input');
                    fakeSubmit.setAttribute('type', 'submit');
                    fakeSubmit.style.display = 'none';
                    var form = element.querySelector('form');
                    form.appendChild(fakeSubmit);
                    fakeSubmit.click();
                    form.removeChild(fakeSubmit);
                });
            }
        }
    });

    document.addEventListener("viewshow-manualserver", function (e) {

        var element = e.target;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        Emby.Page.setTitle(null);
        Emby.Backdrop.clear();

        element.querySelector('.txtServerHost').value = '';
        element.querySelector('.txtServerPort').value = '8096';

        if (!isRestored) {
            element.querySelector('form').addEventListener('submit', function (e) {

                var address = this.querySelector('.txtServerHost').value;
                var port = this.querySelector('.txtServerPort').value;

                if (port) {
                    address += ':' + port;
                }

                require(['connectionManager', 'loading'], function (connectionManager, loading) {

                    loading.show();

                    connectionManager.connectToAddress(address).then(function (result) {

                        loading.hide();

                        handleConnectionResult(result, element);
                    });
                });

                e.preventDefault();
                return false;
            });

            element.querySelector('.buttonCancel').addEventListener('click', function (e) {

                Emby.Page.back();
            });

            var paperSubmit = element.querySelector('.paperSubmit');
            if (paperSubmit) {
                // This element won't be here in the lite version
                paperSubmit.addEventListener('click', function (e) {

                    // Do a fake form submit this the button isn't a real submit button
                    var fakeSubmit = document.createElement('input');
                    fakeSubmit.setAttribute('type', 'submit');
                    fakeSubmit.style.display = 'none';
                    var form = element.querySelector('form');
                    form.appendChild(fakeSubmit);
                    fakeSubmit.click();
                    form.removeChild(fakeSubmit);
                });
            }
        }
    });

    document.addEventListener("viewshow-connectlogin", function (e) {

        var element = e.target;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        Emby.Page.setTitle(null);
        Emby.Backdrop.clear();

        if (!isRestored) {
            element.querySelector('form').addEventListener('submit', function (e) {

                signIntoConnect(element);
                e.preventDefault();
                return false;
            });

            element.querySelector('.btnSkipConnect').addEventListener('click', function (e) {

                require(['connectionManager', 'loading'], function (connectionManager, loading) {

                    loading.show();

                    connectionManager.connect().then(function (result) {

                        loading.hide();

                        if (result.State == MediaBrowser.ConnectionState.ConnectSignIn) {
                            Emby.Page.show('/startup/manualserver.html');
                        } else {
                            handleConnectionResult(result, element);
                        }
                    });
                });
            });

            var paperSubmit = element.querySelector('.paperSubmit');
            if (paperSubmit) {
                // This element won't be here in the lite version
                paperSubmit.addEventListener('click', function (e) {

                    // Do a fake form submit this the button isn't a real submit button
                    var fakeSubmit = document.createElement('input');
                    fakeSubmit.setAttribute('type', 'submit');
                    fakeSubmit.style.display = 'none';
                    var form = element.querySelector('form');
                    form.appendChild(fakeSubmit);
                    fakeSubmit.click();
                    form.removeChild(fakeSubmit);
                });
            }
        }
    });

    function signIntoConnect(view) {

        var username = view.querySelector('.txtConnectUserName').value;
        var password = view.querySelector('.txtConnectPassword').value;

        require(['connectionManager', 'loading', 'alert'], function (connectionManager, loading, alert) {

            loading.show();

            connectionManager.loginToConnect(username, password).then(function () {

                loading.hide();

                Emby.Page.show('/startup/selectserver.html');

            }, function () {

                loading.hide();

                alert({
                    text: Globalize.translate('core#MessageInvalidUser'),
                    title: Globalize.translate('core#HeaderLoginFailure')
                });

            });
        });
    }

    function onServerUserSignedIn(view) {

        var horizontalPageContent = view.querySelector('.pageContainer');
        zoomOut(horizontalPageContent, 1).onfinish = function () {
            Emby.ThemeManager.loadUserTheme();

        };
    }

    function handleConnectionResult(result, view) {

        switch (result.State) {

            case MediaBrowser.ConnectionState.SignedIn:
                {
                    onServerUserSignedIn(view);
                }
                break;
            case MediaBrowser.ConnectionState.ServerSignIn:
                {
                    require(['loading'], function (loading) {

                        loading.show();
                        result.ApiClient.getPublicUsers().then(function (users) {
                            loading.hide();

                            if (users.length) {

                                Emby.Page.show('/startup/login.html?serverid=' + result.Servers[0].Id);
                            } else {
                                Emby.Page.show('/startup/manuallogin.html?serverid=' + result.Servers[0].Id);
                            }
                        });
                    });
                }
                break;
            case MediaBrowser.ConnectionState.ServerSelection:
                {
                    Emby.Page.show('/startup/selectserver.html');
                }
                break;
            case MediaBrowser.ConnectionState.ConnectSignIn:
                {
                    Emby.Page.show('/startup/connectlogin.html');
                }
                break;
            case MediaBrowser.ConnectionState.Unavailable:
                {
                    require(['alert'], function (alert) {

                        alert({
                            text: Globalize.translate("core#MessageUnableToConnectToServer"),
                            title: Globalize.translate("core#HeaderConnectionFailure")
                        });
                    });
                }
                break;
            default:
                break;
        }
    }

    document.addEventListener("viewshow-login", function (e) {

        var element = e.target;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;

        var serverId = params.serverid;

        Emby.Page.setTitle(null);
        Emby.Backdrop.clear();

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            var apiClient = connectionManager.getApiClient(serverId);
            apiClient.getPublicUsers().then(function (result) {

                renderLoginUsers(element, apiClient, result, serverId, !isRestored);
                element.querySelector('.pageHeader').classList.remove('hide');

            }, function (result) {

                renderLoginUsers(element, apiClient, [], serverId, !isRestored);
            });
        });

        if (!isRestored) {
            element.querySelector('.scrollSlider').addEventListener('click', function (e) {

                onScrollSliderClick(e, function (card) {

                    var url = card.getAttribute('data-url');

                    if (url) {
                        Emby.Page.show(url);
                    } else {
                        authenticateUser(element, card.getAttribute('data-serverid'), card.getAttribute('data-name'));
                    }
                });
            });
        }
    });

    function renderLoginUsers(view, apiClient, users, serverId, initScroller) {

        var items = users.map(function (user) {

            var imgUrl = user.PrimaryImageTag ?
                apiClient.getUserImageUrl(user.Id, {
                    width: 400,
                    tag: user.PrimaryImageTag,
                    type: "Primary"
                }) :
                '';

            var url = user.HasPassword ?
                ('/startup/manuallogin.html?serverid=' + serverId + '&user=' + user.Name) :
                '';

            return {
                name: user.Name,
                showIcon: !imgUrl,
                showImage: imgUrl,
                icon: 'person',
                cardImageStyle: "background-image:url('" + imgUrl + "');",
                id: user.Id,
                url: url,
                serverId: user.ServerId,
                defaultText: true
            };

        });

        items.push({
            name: Globalize.translate('core#ButtonManualLogin'),
            showIcon: true,
            showImage: false,
            icon: 'lock',
            cardImageStyle: '',
            cardType: 'manuallogin',
            defaultText: true,
            url: '/startup/manuallogin.html?serverid=' + serverId
        });

        items.push({
            name: Globalize.translate('core#EmbyConnect'),
            showIcon: true,
            showImage: false,
            icon: 'cloud',
            cardImageStyle: '',
            cardType: 'embyconnect',
            defaultText: true,
            url: '/startup/connectlogin.html'
        });

        items.push({
            name: Globalize.translate('core#ButtonChangeServer'),
            showIcon: true,
            showImage: false,
            icon: 'cast',
            cardImageStyle: '',
            cardType: 'changeserver',
            defaultText: true,
            url: '/startup/selectserver.html'
        });

        var html = items.map(function (item) {

            var secondaryText = item.defaultText ? '&nbsp;' : '';

            var cardImageContainer;

            if (item.showIcon) {
                cardImageContainer = '<iron-icon class="cardImageIcon" icon="' + item.icon + '"></iron-icon>';
            } else {
                cardImageContainer = '<div class="cardImage" style="' + item.cardImageStyle + '"></div>';
            }

            var tagName = 'paper-button';
            var innerOpening = '<div class="cardBox">';
            var innerClosing = '</div>';

            return '\
<' + tagName + ' raised class="card squareCard loginSquareCard scalableCard" data-cardtype="' + item.cardType + '" data-url="' + item.url + '" data-name="' + item.name + '" data-serverid="' + item.serverId + '">\
'+ innerOpening + '<div class="cardScalable">\
<div class="cardPadder"></div>\
<div class="cardContent">\
<div class="cardImageContainer coveredImage defaultCardColor'+ getRandomInt(1, 5) + '">\
'+ cardImageContainer + '</div>\
</div>\
</div>\
<div class="cardFooter">\
<div class="cardText">'+ item.name + '</div>\
<div class="cardText dim">' + secondaryText + '</div>\
</div>'+ innerClosing + '\
</'+ tagName + '>';

        }).join('');

        var scrollSlider = view.querySelector('.scrollSlider');
        scrollSlider.innerHTML = html;

        require(["Sly", 'loading'], function (Sly, loading) {

            loading.hide();

            if (initScroller) {
                createHorizontalScroller(view, Sly);
            }

            Emby.FocusManager.autoFocus(scrollSlider, true);
        });
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function onScrollSliderClick(e, callback) {

        var card = Emby.Dom.parentWithClass(e.target, 'card');

        if (card) {
            callback(card);
        }
    }

    function zoomOut(elem, iterations) {
        var keyframes = [

          { transform: 'none', opacity: '1', transformOrigin: 'center', offset: 0 },
          { transform: 'scale3d(.7, .7, .7)  ', opacity: '.7', transformOrigin: 'center', offset: .3 },
          { transform: 'scale3d(.3, .3, .3)  rotate3d(0, 0, 1, -180deg)', opacity: '0', transformOrigin: 'center', offset: 1 }

        ];

        var timing = { duration: 1000, iterations: iterations, fill: 'both' };

        return elem.animate(keyframes, timing);
    }

    function rotateOut(elem, iterations) {
        var transformOrigin = elem.style['transform-origin'];
        var keyframes = [{ transform: 'none', opacity: '1', transformOrigin: 'center', offset: 0 },
          { transform: 'rotate3d(0, 0, 1, -180deg)', opacity: '.2', transformOrigin: 'center', offset: 1 }];
        var timing = { duration: 900, iterations: iterations, fill: 'both' };
        return elem.animate(keyframes, timing);

    }

    function authenticateUser(view, serverId, username, password) {

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            var apiClient = connectionManager.getApiClient(serverId);
            apiClient.authenticateUserByName(username, password).then(function (result) {

                loading.hide();

                onServerUserSignedIn(view);

            }, function (result) {

                loading.hide();

                require(['alert'], function (alert) {
                    alert({
                        text: Globalize.translate('core#MessageInvalidUser'),
                        title: Globalize.translate('core#SignInError')
                    });
                });
            });
        });
    }

    document.addEventListener("viewshow-selectserver", function (e) {

        var element = e.target;
        var params = e.detail.params;
        var isRestored = e.detail.isRestored;
        var servers = [];

        Emby.Page.setTitle(null);
        Emby.Backdrop.clear();

        require(['connectionManager', 'loading'], function (connectionManager, loading) {

            loading.show();

            connectionManager.getAvailableServers().then(function (result) {

                servers = result;
                renderSelectServerItems(element, result, !isRestored);
                element.querySelector('.pageHeader').classList.remove('hide');

            }, function (result) {

                servers = [];
                renderSelectServerItems(element, [], !isRestored);
                element.querySelector('.pageHeader').classList.remove('hide');
            });
        });

        if (!isRestored) {
            element.querySelector('.scrollSlider').addEventListener('click', function (e) {

                onScrollSliderClick(e, function (card) {

                    var url = card.getAttribute('data-url');

                    if (url) {
                        Emby.Page.show(url);
                    } else {

                        require(['connectionManager', 'loading'], function (connectionManager, loading) {

                            loading.show();

                            var id = card.getAttribute('data-id');
                            var server = servers.filter(function (s) {
                                return s.Id == id;
                            })[0];

                            connectionManager.connectToServer(server).then(function (result) {

                                loading.hide();
                                handleConnectionResult(result, element);
                            });
                        });
                    }
                });
            });
        }
    });

    function createHorizontalScroller(view, Sly) {

        var scrollFrame = view.querySelector('.scrollFrame');

        require(['loading'], function (loading) {
            loading.hide();
        });

        scrollFrame.style.display = 'block';

        var options = {
            horizontal: 1,
            itemNav: 0,
            mouseDragging: 1,
            touchDragging: 1,
            slidee: view.querySelector('.scrollSlider'),
            itemSelector: '.card',
            smart: true,
            releaseSwing: true,
            scrollBy: 200,
            speed: 340,
            elasticBounds: 1,
            dragHandle: 1,
            dynamicHandle: 1,
            clickBar: 1,
            scrollWidth: 100000
        };

        var frame = new Sly(scrollFrame, options).init();

        view.querySelector('.scrollSlider').addEventListener('focus', function (e) {

            var focused = Emby.FocusManager.focusableParent(e.target);
            focusedElement = focused;

            if (focused) {
                frame.toCenter(focused);
            }
        }, true);

        // TODO: Not exactly sure yet why this can't be focused immediately
        setTimeout(function () {
            var firstCard = scrollFrame.querySelector('.card');

            if (firstCard) {
                Emby.FocusManager.focus(firstCard);
            }
        }, 200);
    }

    function renderSelectServerItems(view, servers, initScroller) {

        var items = servers.map(function (server) {

            return {
                name: server.Name,
                showIcon: true,
                icon: 'cast',
                cardType: '',
                id: server.Id,
                server: server
            };

        });

        items.push({
            name: Globalize.translate('core#ButtonNewServer'),
            showIcon: true,
            showImage: false,
            icon: 'add',
            cardImageStyle: '',
            id: 'changeserver',
            cardType: 'changeserver',
            url: '/startup/manualserver.html'
        });

        items.push({
            name: Globalize.translate('core#EmbyConnect'),
            showIcon: true,
            showImage: false,
            icon: 'cloud',
            cardImageStyle: '',
            cardType: 'embyconnect',
            defaultText: true,
            url: '/startup/connectlogin.html'
        });

        var html = items.map(function (item) {

            var cardImageContainer;

            if (item.showIcon) {
                cardImageContainer = '<iron-icon class="cardImageIcon" icon="' + item.icon + '"></iron-icon>';
            } else {
                cardImageContainer = '<div class="cardImage" style="' + item.cardImageStyle + '"></div>';
            }

            var tagName = 'paper-button';
            var innerOpening = '<div class="cardBox">';
            var innerClosing = '</div>';

            return '\
<' + tagName + ' raised class="card squareCard loginSquareCard scalableCard" data-id="' + item.id + '" data-url="' + (item.url || '') + '" data-cardtype="' + item.cardType + '">\
'+ innerOpening + '<div class="cardScalable">\
<div class="cardPadder"></div>\
<div class="cardContent">\
<div class="cardImageContainer coveredImage defaultCardColor' + getRandomInt(1, 5) + '">\
'+ cardImageContainer + '</div>\
</div>\
</div>\
<div class="cardFooter">\
<div class="cardText">'+ item.name + '</div>\
</div>'+ innerClosing + '\
</'+ tagName + '>';

        }).join('');

        view.querySelector('.scrollSlider').innerHTML = html;

        require(["Sly", 'loading'], function (Sly, loading) {
            loading.hide();

            if (initScroller) {
                createHorizontalScroller(view, Sly);
            }
        });
    }

})(document);
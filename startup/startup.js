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
                    text: Globalize.translate('MessageInvalidUser'),
                    title: Globalize.translate('HeaderLoginFailure')
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
                            text: Globalize.translate("MessageUnableToConnectToServer"),
                            title: Globalize.translate("HeaderConnectionFailure")
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
                lastActive: getLastActiveText(user),
                cardImageStyle: "background-image:url('" + imgUrl + "');",
                hasLastActive: true,
                id: user.Id,
                url: url,
                serverId: user.ServerId
            };

        });

        items.push({
            name: Globalize.translate('ButtonManualLogin'),
            showIcon: true,
            showImage: false,
            icon: 'lock',
            cardImageStyle: '',
            cardType: 'manuallogin',
            defaultText: true,
            url: '/startup/manuallogin.html?serverid=' + serverId
        });

        items.push({
            name: Globalize.translate('HeaderSignInWithConnect'),
            showIcon: true,
            showImage: false,
            icon: 'cloud',
            cardImageStyle: '',
            cardType: 'embyconnect',
            defaultText: true,
            url: '/startup/connectlogin.html'
        });

        items.push({
            name: Globalize.translate('ButtonChangeServer'),
            showIcon: true,
            showImage: false,
            icon: 'cast',
            cardImageStyle: '',
            cardType: 'changeserver',
            defaultText: true,
            url: '/startup/selectserver.html'
        });

        var html = items.map(function (item) {

            var secondaryText = item.defaultText ? '&nbsp;' : (item.lastActive || '');

            var cardImageContainer;

            if (item.showIcon) {
                if (Emby.Dom.supportsWebComponents()) {
                    cardImageContainer = '<iron-icon class="cardImageIcon" icon="' + item.icon + '"></iron-icon>';
                } else {
                    cardImageContainer = '';
                }
            } else {
                cardImageContainer = '<div class="cardImage" style="' + item.cardImageStyle + '"></div>';
            }

            var tagName;
            var innerOpening;
            var innerClosing;

            if (Emby.Dom.supportsWebComponents()) {
                tagName = 'paper-button';
                innerOpening = '<div class="cardBox">';
                innerClosing = '</div>';
            } else {
                tagName = 'button';
                innerOpening = '<div class="cardBox">';
                innerClosing = '</div>';
            }

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
                        text: Globalize.translate('MessageInvalidUser'),
                        title: Globalize.translate('SignInError')
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
            name: Globalize.translate('ButtonNewServer'),
            showIcon: true,
            showImage: false,
            icon: 'add',
            cardImageStyle: '',
            id: 'changeserver',
            cardType: 'changeserver',
            url: '/startup/manualserver.html'
        });

        var html = items.map(function (item) {

            var cardImageContainer;

            if (item.showIcon) {
                if (Emby.Dom.supportsWebComponents()) {
                    cardImageContainer = '<iron-icon class="cardImageIcon" icon="' + item.icon + '"></iron-icon>';
                } else {
                    cardImageContainer = '';
                }
            } else {
                cardImageContainer = '<div class="cardImage" style="' + item.cardImageStyle + '"></div>';
            }

            var tagName;
            var innerOpening;
            var innerClosing;

            if (Emby.Dom.supportsWebComponents()) {
                tagName = 'paper-button';
                innerOpening = '<div class="cardBox">';
                innerClosing = '</div>';
            } else {
                tagName = 'button';
                innerOpening = '<div class="cardBox">';
                innerClosing = '</div>';
            }

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

    function getLastActiveText(user) {

        if (!user.LastActivityDate) {
            return "Last seen never";
        }

        return "Last seen " + humane_date(user.LastActivityDate);
    }

    /*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 *
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 *
 * Licensed under the MIT license.
 */

    function humane_date(date_str) {
        var time_formats = [[90, 'a minute'], // 60*1.5
        [3600, 'minutes', 60], // 60*60, 60
        [5400, 'an hour'], // 60*60*1.5
        [86400, 'hours', 3600], // 60*60*24, 60*60
        [129600, 'a day'], // 60*60*24*1.5
        [604800, 'days', 86400], // 60*60*24*7, 60*60*24
        [907200, 'a week'], // 60*60*24*7*1.5
        [2628000, 'weeks', 604800], // 60*60*24*(365/12), 60*60*24*7
        [3942000, 'a month'], // 60*60*24*(365/12)*1.5
        [31536000, 'months', 2628000], // 60*60*24*365, 60*60*24*(365/12)
        [47304000, 'a year'], // 60*60*24*365*1.5
        [3153600000, 'years', 31536000] // 60*60*24*365*100, 60*60*24*365
        ];

        var dt = new Date;
        var date = Emby.DateTime.parseISO8601Date(date_str);

        var seconds = ((dt - date) / 1000);
        var token = ' ago';
        var i = 0;
        var format;

        if (seconds < 0) {
            seconds = Math.abs(seconds);
            token = '';
        }

        while (format = time_formats[i++]) {
            if (seconds < format[0]) {
                if (format.length == 2) {
                    return format[1] + token;
                } else {
                    return Math.round(seconds / format[2]) + ' ' + format[1] + token;
                }
            }
        }

        // overflow for centuries
        if (seconds > 4730400000)
            return Math.round(seconds / 4730400000) + ' centuries' + token;

        return date_str;
    }

})(document);
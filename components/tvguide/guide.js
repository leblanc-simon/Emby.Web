define([], function () {

    return function (options) {

        var self = this;

        self.refresh = function () {
            reloadPage(options.element);
        };

        // 30 mins
        var cellCurationMinutes = 30;
        var cellDurationMs = cellCurationMinutes * 60 * 1000;
        var msPerDay = 86400000;

        var currentDate;

        var defaultChannels = 50;
        var channelLimit = 1000;

        var channelQuery = {

            StartIndex: 0,
            Limit: defaultChannels,
            EnableFavoriteSorting: true
        };

        var channelsPromise;

        function normalizeDateToTimeslot(date) {

            var minutesOffset = date.getMinutes() - cellCurationMinutes;

            if (minutesOffset >= 0) {

                date.setHours(date.getHours(), cellCurationMinutes, 0, 0);

            } else {

                date.setHours(date.getHours(), 0, 0, 0);
            }

            return date;
        }

        function reloadChannels(page) {
            channelsPromise = null;
            reloadGuide(page);
        }

        function showLoading() {

        }

        function hideLoading() {

        }

        function reloadGuide(page) {

            showLoading();

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                channelQuery.UserId = apiClient.getCurrentUserId();

                channelQuery.Limit = Math.min(channelQuery.Limit || defaultChannels, channelLimit);
                channelQuery.AddCurrentProgram = false;

                channelsPromise = channelsPromise || apiClient.getLiveTvChannels(channelQuery);

                var date = currentDate;

                var nextDay = new Date(date.getTime() + msPerDay - 1);
                Logger.log(nextDay);
                channelsPromise.done(function (channelsResult) {

                    apiClient.getLiveTvPrograms({
                        UserId: apiClient.getCurrentUserId(),
                        MaxStartDate: nextDay.toISOString(),
                        MinEndDate: date.toISOString(),
                        channelIds: channelsResult.Items.map(function (c) {
                            return c.Id;
                        }).join(','),
                        ImageTypeLimit: 1,
                        EnableImageTypes: "Primary",
                        SortBy: "StartDate"

                    }).done(function (programsResult) {

                        renderGuide(page, date, channelsResult.Items, programsResult.Items, apiClient);

                        hideLoading();

                    });
                });
            });
        }

        function getDisplayTime(date) {

            if ((typeof date).toString().toLowerCase() === 'string') {
                try {

                    date = parseISO8601Date(date, { toLocal: true });

                } catch (err) {
                    return date;
                }
            }

            var lower = date.toLocaleTimeString().toLowerCase();

            var hours = date.getHours();
            var minutes = date.getMinutes();

            var text;

            if (lower.indexOf('am') != -1 || lower.indexOf('pm') != -1) {

                var suffix = hours > 11 ? 'pm' : 'am';

                hours = (hours % 12) || 12;

                text = hours;

                if (minutes) {

                    text += ':';
                    if (minutes < 10) {
                        text += '0';
                    }
                    text += minutes;
                }

                text += suffix;

            } else {
                text = hours + ':';

                if (minutes < 10) {
                    text += '0';
                }
                text += minutes;
            }

            return text;
        }


        function getTimeslotHeadersHtml(startDate, endDateTime) {

            var html = '';

            // clone
            startDate = new Date(startDate.getTime());

            html += '<div class="timeslotHeadersInner">';

            while (startDate.getTime() < endDateTime) {

                html += '<div class="timeslotHeader">';

                html += getDisplayTime(startDate);
                html += '</div>';

                // Add 30 mins
                startDate.setTime(startDate.getTime() + cellDurationMs);
            }
            html += '</div>';

            return html;
        }

        function parseDates(program) {

            if (!program.StartDateLocal) {
                try {

                    program.StartDateLocal = Emby.DateTime.parseISO8601Date(program.StartDate, { toLocal: true });

                } catch (err) {

                }

            }

            if (!program.EndDateLocal) {
                try {

                    program.EndDateLocal = Emby.DateTime.parseISO8601Date(program.EndDate, { toLocal: true });

                } catch (err) {

                }

            }

            return null;
        }

        function getChannelProgramsHtml(page, date, channel, programs) {

            var html = '';

            var startMs = date.getTime();
            var endMs = startMs + msPerDay - 1;

            programs = programs.filter(function (curr) {
                return curr.ChannelId == channel.Id;
            });

            html += '<div class="channelPrograms">';

            for (var i = 0, length = programs.length; i < length; i++) {

                var program = programs[i];

                if (program.ChannelId != channel.Id) {
                    continue;
                }

                parseDates(program);

                if (program.EndDateLocal.getTime() < startMs) {
                    continue;
                }

                if (program.StartDateLocal.getTime() > endMs) {
                    break;
                }

                var renderStartMs = Math.max(program.StartDateLocal.getTime(), startMs);
                var startPercent = (program.StartDateLocal.getTime() - startMs) / msPerDay;
                startPercent *= 100;
                startPercent = Math.max(startPercent, 0);

                var renderEndMs = Math.min(program.EndDateLocal.getTime(), endMs);
                var endPercent = (renderEndMs - renderStartMs) / msPerDay;
                endPercent *= 100;

                var cssClass = "programCell";
                var addAccent = true;

                if (program.IsKids) {
                    cssClass += " childProgramInfo";
                } else if (program.IsSports) {
                    cssClass += " sportsProgramInfo";
                } else if (program.IsNews) {
                    cssClass += " newsProgramInfo";
                } else if (program.IsMovie) {
                    cssClass += " movieProgramInfo";
                }
                else {
                    cssClass += " plainProgramInfo";
                    addAccent = false;
                }

                html += '<a href="itemdetails.html?id=' + program.Id + '" data-programid="' + program.Id + '" class="' + cssClass + '" style="left:' + startPercent + '%;width:' + endPercent + '%;">';

                var guideProgramNameClass = "guideProgramName";

                html += '<div class="' + guideProgramNameClass + '">';
                html += program.Name;
                html += '</div>';

                if (program.IsHD) {
                    html += '<iron-icon icon="hd"></iron-icon>';
                }

                //html += '<div class="guideProgramTime">';
                //if (program.IsLive) {
                //    html += '<span class="liveTvProgram">' + Globalize.translate('LabelLiveProgram') + '&nbsp;&nbsp;</span>';
                //}
                //else if (program.IsPremiere) {
                //    html += '<span class="premiereTvProgram">' + Globalize.translate('LabelPremiereProgram') + '&nbsp;&nbsp;</span>';
                //}
                //else if (program.IsSeries && !program.IsRepeat) {
                //    html += '<span class="newTvProgram">' + Globalize.translate('LabelNewProgram') + '&nbsp;&nbsp;</span>';
                //}

                //html += getDisplayTime(program.StartDateLocal);
                //html += ' - ';
                //html += getDisplayTime(program.EndDateLocal);

                //if (program.SeriesTimerId) {
                //    html += '<div class="timerCircle seriesTimerCircle"></div>';
                //    html += '<div class="timerCircle seriesTimerCircle"></div>';
                //    html += '<div class="timerCircle seriesTimerCircle"></div>';
                //}
                //else if (program.TimerId) {

                //    html += '<div class="timerCircle"></div>';
                //}
                //html += '</div>';

                if (addAccent) {
                    html += '<div class="programAccent"></div>';
                }

                html += '</a>';
            }

            html += '</div>';

            return html;
        }

        function renderPrograms(page, date, channels, programs) {

            var html = [];

            for (var i = 0, length = channels.length; i < length; i++) {

                html.push(getChannelProgramsHtml(page, date, channels[i], programs));
            }

            var programGrid = page.querySelector('.programGrid');
            programGrid.innerHTML = html.join('');

            programGrid.scrollTop = 0;
            programGrid.scrollLeft = 0;
        }

        function renderChannelHeaders(page, channels, apiClient) {

            var html = '';

            for (var i = 0, length = channels.length; i < length; i++) {

                var channel = channels[i];

                html += '<a class="channelHeaderCell" href="itemdetails.html?id=' + channel.Id + '">';

                var hasChannelImage = channel.ImageTags.Primary;
                var cssClass = hasChannelImage ? 'guideChannelInfo guideChannelInfoWithImage' : 'guideChannelInfo';

                html += '<div class="' + cssClass + '">' + channel.Number + '</div>';

                if (hasChannelImage) {

                    var url = apiClient.getScaledImageUrl(channel.Id, {
                        maxHeight: 40,
                        maxWidth: 80,
                        tag: channel.ImageTags.Primary,
                        type: "Primary"
                    });

                    html += '<div class="guideChannelImage lazy" data-src="' + url + '"></div>';
                }

                html += '</a>';
            }

            var channelList = page.querySelector('.channelList');
            channelList.innerHTML = html;
            Emby.ImageLoader.lazyChildren(channelList);
        }

        function renderGuide(page, date, channels, programs, apiClient) {

            renderChannelHeaders(page, channels, apiClient);

            var startDate = date;
            var endDate = new Date(startDate.getTime() + msPerDay);
            page.querySelector('.timeslotHeaders').innerHTML = getTimeslotHeadersHtml(startDate, endDate);
            renderPrograms(page, date, channels, programs);
        }

        var gridScrolling = false;
        var headersScrolling = false;
        function onProgramGridScroll(page, elem) {

            if (!headersScrolling) {
                gridScrolling = true;

                $(page.querySelector('.timeslotHeaders')).scrollLeft($(elem).scrollLeft());
                gridScrolling = false;
            }
        }

        function onTimeslotHeadersScroll(page, elem) {

            if (!gridScrolling) {
                headersScrolling = true;
                $(page.querySelector('.programGrid')).scrollLeft($(elem).scrollLeft());
                headersScrolling = false;
            }
        }

        function getFutureDateText(date) {

            var weekday = [];
            weekday[0] = Globalize.translate('OptionSundayShort');
            weekday[1] = Globalize.translate('OptionMondayShort');
            weekday[2] = Globalize.translate('OptionTuesdayShort');
            weekday[3] = Globalize.translate('OptionWednesdayShort');
            weekday[4] = Globalize.translate('OptionThursdayShort');
            weekday[5] = Globalize.translate('OptionFridayShort');
            weekday[6] = Globalize.translate('OptionSaturdayShort');

            var day = weekday[date.getDay()];
            date = date.toLocaleDateString();

            if (date.toLowerCase().indexOf(day.toLowerCase()) == -1) {
                return day + " " + date;
            }

            return date;
        }

        function changeDate(page, date) {

            currentDate = normalizeDateToTimeslot(date);

            reloadGuide(page);

            var text = getFutureDateText(date);
            text = '<span class="currentDay">' + text.replace(' ', ' </span>');
            page.querySelector('.btnSelectDate').innerHTML = text;
        }

        var dateOptions = [];

        function setDateRange(page, guideInfo) {

            var today = new Date();
            today.setHours(today.getHours(), 0, 0, 0);

            var start = Emby.DateTime.parseISO8601Date(guideInfo.StartDate, { toLocal: true });
            var end = Emby.DateTime.parseISO8601Date(guideInfo.EndDate, { toLocal: true });

            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            if (start.getTime() >= end.getTime()) {
                end.setDate(start.getDate() + 1);
            }

            start = new Date(Math.max(today, start));

            dateOptions = [];

            while (start <= end) {

                dateOptions.push({
                    name: getFutureDateText(start),
                    id: start.getTime(),
                    ironIcon: 'today'
                });

                start.setDate(start.getDate() + 1);
                start.setHours(0, 0, 0, 0);
            }

            var date = new Date();

            if (currentDate) {
                date.setTime(currentDate.getTime());
            }

            changeDate(page, date);
        }

        function reloadPageAfterValidation(page, limit) {

            channelLimit = limit;

            require(['connectionManager'], function (connectionManager) {

                var apiClient = connectionManager.currentApiClient();

                apiClient.getLiveTvGuideInfo().done(function (guideInfo) {

                    setDateRange(page, guideInfo);
                });
            });
        }

        function reloadPage(page) {

            showLoading();

            reloadPageAfterValidation(page, 1000);
        }

        function selectDate(page) {

            require(['actionsheet'], function () {

                ActionSheetElement.show({
                    items: dateOptions,
                    showCancel: true,
                    title: Globalize.translate('HeaderSelectDate'),
                    callback: function (id) {

                        var date = new Date();
                        date.setTime(parseInt(id));
                        changeDate(page, date);
                    }
                });

            });
        }

        HttpClient.send({

            type: 'GET',
            url: '/components/tvguide/tvguide.template.html'

        }).done(function (template) {

            var tabContent = options.element;
            tabContent.innerHTML = template;

            tabContent.querySelector('.programGrid').addEventListener('scroll', function () {

                onProgramGridScroll(tabContent, this);
            });

            var isMobile = false;

            if (isMobile) {
                tabContent.querySelector('.tvGuide').classList.add('mobileGuide');
            } else {

                tabContent.querySelector('.tvGuide').classList.remove('mobileGuide');

                tabContent.querySelector('.timeslotHeaders').addEventListener('scroll', function () {

                    onTimeslotHeadersScroll(tabContent, this);
                });
            }

            tabContent.querySelector('.btnSelectDate').addEventListener('click', function () {

                selectDate(tabContent);
            });

            self.refresh();
        });
    };
});
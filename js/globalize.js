(function (globalScope) {

    var allTranslations = {};

    function getCurrentLocale() {

        return 'en-us';
    }

    function getDictionary(module) {

        if (module == 'theme') {
            module = Emby.ThemeManager.getCurrentTheme().packageName;
        }

        var translations = allTranslations[module];

        if (!translations) {
            return {};
        }

        return translations.dictionaries[getCurrentLocale()];
    }

    function loadTranslations(options) {

        allTranslations[options.name] = {
            translations: options.translations,
            dictionaries: {}
        };

        var locale = getCurrentLocale();
        return loadTranslation(options.translations, locale).then(function (dictionary) {

            allTranslations[options.name].dictionaries[locale] = dictionary;
        });
    }

    var cacheParam = new Date().getTime();
    function loadTranslation(translations, lang) {

        var filtered = translations.filter(function (t) {
            return t.lang == lang;
        });

        if (!filtered.length) {
            filtered = translations.filter(function (t) {
                return t.lang == 'en-us';
            });
        }

        return new Promise(function (resolve, reject) {

            if (!filtered.length) {
                resolve();
                return;
            }

            var url = filtered[0].path;
            url += url.indexOf('?') == -1 ? '?' : '&';
            url += 'v=' + cacheParam;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);

            xhr.onload = function (e) {
                if (this.status < 400) {
                    resolve(JSON.parse(this.response));
                }
                resolve({});
            };

            xhr.onerror = function () {
                resolve({});
            };
            xhr.send();
        });
    }

    function extend(target) {
        var slice = Array.prototype.slice;
        slice.call(arguments, 1).forEach(function (source) {
            for (key in source)
                if (source[key] !== undefined)
                    target[key] = source[key]
        })
        return target
    }

    function translateKey(key) {

        var parts = key.split('#');
        var module;

        if (parts.length == 1) {
            module = 'theme';
        } else {
            module = parts[0];
            key = parts[1];
        }

        return translateKeyFromModule(key, module);
    }

    function translateKeyFromModule(key, module) {

        return getDictionary(module)[key] || key;
    }

    function translate(key) {

        var val = translateKey(key);

        for (var i = 1; i < arguments.length; i++) {

            val = val.replace('{' + (i - 1) + '}', arguments[i]);

        }

        return val;
    }

    function translateHtml(html, module) {

        if (!module) {
            throw new Error('module cannot be null or empty');
        }

        var startIndex = html.indexOf('${');

        if (startIndex == -1) {
            return html;
        }

        startIndex += 2;
        var endIndex = html.indexOf('}', startIndex);

        if (endIndex == -1) {
            return html;
        }

        var key = html.substring(startIndex, endIndex);
        var val = translateKeyFromModule(key, module);

        html = html.replace('${' + key + '}', val);
        return translateHtml(html, module);
    }

    globalScope.Globalize = {
        translate: translate,
        translateHtml: translateHtml,
        loadTranslations: loadTranslations
    };

})(this, document);

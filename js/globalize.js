(function (globalScope) {

    var allTranslations = [];
    var dictionary = {};

    function getDictionary() {

        return dictionary;
    }

    function loadTranslations(options) {

        var found = false;

        for (var i = 0, length = allTranslations.length; i < length; i++) {

            if (options.name == allTranslations[i].name) {
                allTranslations[i] = options;
                found = true;
                break;
            }
        }

        if (!found) {
            allTranslations.push(options);
        }

        return loadTranslation(options.translations, 'en-us', dictionary);
    }

    function loadLanguage(lang) {

        return new Promise(function (resolve, reject) {

            var masterDictionary = {};
            // Go through each translation, get the file for the language, add it to dictionary

            dictionary = masterDictionary;
            resolve();
        });
    }

    function loadTranslation(translations, lang, dictionary) {

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

            fetch(filtered[0].path, { mode: 'no-cors' }).then(function (response) {
                return response.json();
            }).then(function (json) {
                dictionary = extend(dictionary, json);
                resolve();
            });
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

        return getDictionary()[key] || key;
    }

    function translate(key) {

        var val = translateKey(key);

        for (var i = 1; i < arguments.length; i++) {

            val = val.replace('{' + (i - 1) + '}', arguments[i]);

        }

        return val;
    }

    function translateHtml(html) {

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
        var val = translateKey(key);

        html = html.replace('${' + key + '}', val);

        return translateHtml(html);
    }

    globalScope.Globalize = {
        translate: translate,
        translateHtml: translateHtml,
        loadTranslations: loadTranslations
    };

})(this, document);

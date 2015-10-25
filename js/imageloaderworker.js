(function (self) {

    function onUrlLoad() {
        self.postMessage('Done!');
        //this.close();
    }

    function startDownloadingUrl(url) {

        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.onload = xhr.onerror = function() {
            self.postMessage(url + '|' + URL.createObjectURL(xhr.response));
        };
        xhr.open('GET', url, true);
        xhr.send();
    }

    self.onmessage = function (e) {
        var url = e.data;

        startDownloadingUrl(url);
    };

})(this);
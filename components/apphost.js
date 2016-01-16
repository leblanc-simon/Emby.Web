define([], function () {

    function getDeviceProfile() {

        // TODO
        return null;
    }

    function getCapabilities() {

        var caps = {
            PlayableMediaTypes: ['Audio', 'Video'],

            SupportsPersistentIdentifier: false,
            DeviceProfile: getDeviceProfile()
        };

        return caps;
    }

    return {
        getWindowState: function () {
            return document.windowState || 'Normal';
        },
        setWindowState: function (state) {
            alert('setWindowState is not supported and should not be called');
        },
        exit: function () {
            alert('exit is not supported and should not be called');
        },
        supports: function (command) {

            // Web-based implementation can't really do much
            return false;
        },
        appInfo: function () {

            return new Promise(function (resolve, reject) {

                var deviceName = "Web Browser";
                var appName = 'Emby Theater';

                function onDeviceAdAcquired(id) {

                    resolve({
                        deviceId: id,
                        deviceName: deviceName,
                        appName: appName,
                        appVersion: '3.0'
                    });
                }

                var key = '_deviceId1';
                var deviceId = appStorage.getItem(key);

                if (deviceId) {
                    onDeviceAdAcquired(deviceId);
                } else {
                    require(['cryptojs-sha1'], function () {
                        var keys = [];
                        keys.push(navigator.userAgent);
                        keys.push((navigator.cpuClass || ""));
                        keys.push(appName);
                        keys.push(new Date().getTime());

                        var randomId = CryptoJS.SHA1(keys.join('|')).toString();
                        appStorage.setItem(key, randomId);
                        onDeviceAdAcquired(randomId);
                    });
                }
            });

        },
        capabilities: getCapabilities
    };
});
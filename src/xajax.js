if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchStr, Position) {
        if (!(Position < this.length))
            Position = this.length;
        else
            Position |= 0;
        return this.substr(Position - searchStr.length, searchStr.length) === searchStr;
    };
}

function isArray(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
}

function inArray(item, arr) {
    for (var i = 0, len = arr.length; i < len; i++) {
        if (item === arr[i]) return i;
    }
    return -1;
}

(function (whitelist, strictMatch) {
    function parseDomain(url) {
        var aTag = window.document.createElement('a');
        aTag.href = url;
        return aTag.hostname;
    }
    var parentHost = parseDomain(window.document.referrer);
    if (strictMatch) {
        if (inArray(parentHost, whitelist) < 0) {
            throw new Error('Host blocked!');
        }
    } else {
        for (var i = 0, len = whitelist.length; i < len; i++) {
            if (parentHost.endsWith(whitelist[i]) || ('.' + parentHost) === whitelist[i]) return true;
        }
        throw new Error('Host blocked!');
    }
})(HostWhitelist);

(function () {
    window.parent.postMessage('[iframexajax:' + window.location.origin + ']ready', '*');
})();

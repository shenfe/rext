var gid = function () {
    return new Date().getTime() * 10000 + Math.floor(Math.random() * 10000);
};

var uid = (function () {
    var n = 0;
    return function () {
        return n++;
    };
})();

var isBoolean = function (v) {
    return typeof v === 'boolean';
};

var isNumber = function (v) {
    return typeof v === 'number';
};

var isNumeric = function (v) {
    var n = parseInt(v);
    if (isNaN(n)) return false;
    return (typeof v === 'number' || typeof v === 'string') && n == v;
};

var isString = function (v) {
    return typeof v === 'string';
};

var isFunction = function (v) {
    return typeof v === 'function';
};

var isObject = function (v) {
    return v != null && Object.prototype.toString.call(v) === '[object Object]';
};

var isArray = function (v) {
    return Object.prototype.toString.call(v) === '[object Array]';
};

var isBasic = function (v) {
    return v == null || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string' || typeof v === 'function';
};

var isInstance = function (v, creator) {
    return typeof creator === 'function' && v instanceof creator;
};

var isDirectInstance = function (v, creator) {
    return v.constructor === creator;
};

var isNode = function (v) {
    if (typeof Node !== 'function') return false;
    return v instanceof Node;
};

var isNamedNodeMap = function (v) {
    return v instanceof NamedNodeMap;
};

var isEventName = function (v) {
    if (!isString(v)) return false;
    return v.startsWith('on'); // TODO
};

var isCSSSelector = function (v) {
    return v.indexOf(' ') > 0 || v.indexOf('.') >= 0 || v.indexOf('[') >= 0 || v.indexOf('#') >= 0;
};

var each = function (v, func, arrayReverse) {
    if (isObject(v)) {
        for (var p in v) {
            if (!v.hasOwnProperty(p)) continue;
            var r = func(v[p], p);
            if (r === false) break;
        }
    } else if (isArray(v)) {
        if (!arrayReverse) {
            for (var i = 0, len = v.length; i < len; i++) {
                var r = func(v[i], i);
                if (r === false) break;
            }
        } else {
            for (var i = v.length - 1; i >= 0; i--) {
                var r = func(v[i], i);
                if (r === false) break;
            }
        }
    } else if (isFunction(v.forEach)) {
        v.forEach(func);
    }
};

var eachUnique = function (arr, func) {
    if (!isArray(arr)) return;
    var map = {};
    for (var i = 0, len = arr.length; i < len; i++) {
        if (!isNumber(arr[i]) || !isString(arr[i]) || map[arr[i]]) continue;
        map[arr[i]] = true;
        var r = func(arr[i]);
        if (r === false) break;
    }
};

var unique = function (arr) {
    var r = [];
    eachUnique(arr, function (v) {
        r.push(v);
    });
    return r;
};

var clone = function (val) {
    var r = val;
    if (isObject(val)) {
        r = {};
        each(val, function (v, p) {
            r[p] = clone(v);
        });
    } else if (isArray(val)) {
        r = [];
        each(val, function (v) {
            r.push(clone(v));
        });
    }
    return r;
};

var hasProperty = function (val, p) {
    if (isObject(val)) {
        return val.hasOwnProperty(p);
    } else if (isArray(val)) {
        var n = parseInt(p);
        return isNumeric(p) && val.length > n && n >= 0;
    }
    return false;
};

var clear = function (val, p, withBasicVal) {
    var inRef = isString(p) || isNumber(p);
    var target = inRef ? val[p] : val;

    if (isObject(target) || isArray(target)) {
        each(target, function (v, p) {
            clear(target, p);
        });
        if (isArray(target)) {
            shrinkArray(target);
        }
    }

    if (inRef) {
        val[p] = withBasicVal;
    }
};

var shrinkArray = function (arr, len) {
    var limited = isNumber(len);
    if (!limited) {
        each(arr, function (v, i) {
            if (v === undefined) arr.length--;
        }, true);
    } else {
        each(arr, function (v, i) {
            if (i >= len) arr.length--;
            else return false;
        }, true);
        while (arr.length < len) {
            arr.push(null);
        }
    }
    return arr;
};

var touchLeaves = function (obj) {
    each(obj, function (v, p) {
        if (isBasic(v)) {
            obj[p] = v;
        } else {
            touchLeaves(v);
        }
    });
};

var extend = function (dest, srcs, clean) {
    if (!isObject(dest)) return null;
    var args = Array.prototype.slice.call(arguments, 1,
        arguments[arguments.length - 1] === true ? (arguments.length - 1) : arguments.length);
    clean = arguments[arguments.length - 1] === true ? true : false;

    function extendObj(obj, src, clean) {
        if (!isObject(src)) return;
        each(src, function (v, p) {
            if (!hasProperty(obj, p) || isBasic(v)) {
                if (obj[p] !== v) {
                    obj[p] = clone(v);
                }
            } else {
                extendObj(obj[p], v, clean);
            }
        });
        if (clean) {
            each(obj, function (v, p) {
                if (!hasProperty(src, p)) {
                    clear(obj, p);
                }
            });
            if (isArray(obj)) {
                shrinkArray(obj);
            }
        }
    }

    each(args, function (src) {
        extendObj(dest, src, clean);
    });
    return dest;
};

var type = function (v) {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    var t = Object.prototype.toString.call(v);
    return t.substring('[object '.length, t.length - 1).toLowerCase();
};

var param = function (obj) {
    // if (type(obj) === 'formdata') return obj;
    if (obj == null) return '';
    if (type(obj) === 'array') return JSON.stringify(obj);
    if (isBasic(obj)) return String(obj);
    var encoded = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            encoded.push(encodeURIComponent(prop) + '=' + encodeURIComponent(isBasic(obj[prop]) ? String(obj[prop]) : JSON.stringify(obj[prop])));
        }
    }
    return encoded.join('&');
};

function completeUrl(url) {
    if (url.charAt(0) === '/') {
        if (url.charAt(1) === '/') {
            url = window.location.protocol + url;
        } else {
            url = window.location.protocol + '//' + window.location.host + url;
        }
    }
    return url;
}

function isCrossDomain(url) {
    url = completeUrl(url);
    var rurl = /^([\w.+-]+:)?(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/;
    var locParts = rurl.exec(window.location.href.toLowerCase()) || [];
    var curParts = rurl.exec(url.toLowerCase());
    if (curParts[1] === undefined) {
        curParts[1] = locParts[1];
    }
    return !!(curParts &&
        (
            curParts[1] !== locParts[1]
            || curParts[2] !== locParts[2]
            || (curParts[3] || (curParts[1] === 'http:' ? '80' : '443'))
                !== (locParts[3] || (locParts[1] === 'http:' ? '80' : '443'))
        )
    );
}

function funcontinue(target, prop) {
    return function (fn) {
        var oldFn = target[prop];
        target[prop] = function () {
            var args = arguments;
            oldFn && oldFn.apply(this, args);
            fn && fn.apply(this, args);
        };
        return this;
    };
}

export {
    gid,
    uid,
    isBoolean,
    isNumber,
    isNumeric,
    isString,
    isFunction,
    isObject,
    isArray,
    isBasic,
    isInstance,
    isDirectInstance,
    isNode,
    isNamedNodeMap,
    isEventName,
    isCSSSelector,
    each,
    eachUnique,
    unique,
    clone,
    hasProperty,
    clear,
    shrinkArray,
    touchLeaves,
    extend,
    type,
    param,
    completeUrl,
    isCrossDomain,
    funcontinue
}

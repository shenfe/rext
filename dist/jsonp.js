(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.rJsonp = {})));
}(this, (function (exports) { 'use strict';

var isBasic = function (v) {
    return v == null || typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string' || typeof v === 'function';
};

var type = function (v) {
    var t = Object.prototype.toString.call(v);
    return t.substring('[object '.length, t.length - 1).toLowerCase();
};

var param = function (obj) {
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

/**
 * Make a JSONP request
 * @param  {Object} options     Options
 * @param  {Function} callback  Callback
 * @return {Undefined|Function}
 */
function send(options, callback) {
    var callbackGlobalName = 'jsonp_' + String((new Date().getTime()) * 1000 + Math.round(Math.random() * 1000));
    window[callbackGlobalName] = callback || options.callback;

    /* Create and insert */
    var ref = window.document.getElementsByTagName('script')[0];
    var script = window.document.createElement('script');
    script.src = options.url
        + (options.url.indexOf('?') >= 0 ? '&' : '?')
        + param(options.data)
        + '&callback=' + callbackGlobalName;
    ref.parentNode.insertBefore(script, ref);

    /* When loaded and executed, clean up */
    script.onload = script.onreadystatechange = function () {
        if (!script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            script = null;
        }
    };

    if (window[callbackGlobalName] == null) {
        return function (fn) {
            window[callbackGlobalName] = fn;
        };
    }
}

exports.send = send;

Object.defineProperty(exports, '__esModule', { value: true });

})));

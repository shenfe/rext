import * as Util from './util.js'

/**
 * Make a JSONP request
 * @param  {Object} options     Settings
 * @return {[type]}             [description]
 */
function jsonp(options) {
    /* Create script with the url and callback */
    var ref = window.document.getElementsByTagName('script')[0];
    var script = window.document.createElement('script');
    var callbackGlobalName = 'jsonp_' + String((new Date().getTime()) * 1000 + Math.round(Math.random() * 1000));
    window[callbackGlobalName] = options.callback;
    options.data.callback = callbackGlobalName;
    script.src = options.url + (options.url.indexOf('?') >= 0 ? '&' : '?') + Util.param(options.data);

    /* Insert script tag into the DOM (append to <head>) */
    ref.parentNode.insertBefore(script, ref);

    /* After the script is loaded and executed, remove it */
    if (script.readyState) { /* IE */
        script.onreadystatechange = function () {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                script.onreadystatechange = null;
                this.remove();
            }
        };
    } else {
        script.onload = function () {
            this.remove();
        };
    }
}

export default jsonp

- [rext](#)
	- [Quick Import](#quick-import)
	- [IE 9- Support](#ie-9--support)
	- [API](#api)
		- [XMLHttpRequest](#xmlhttprequest)
		- [JSONP](#jsonp)
		- [a Wrapped Promise Object](#a-wrapped-promise-object)
	- [Options](#options)
	- [Case Matrix](#case-matrix)
	- [Take a Look at headers['Content-Type']](#take-a-look-at-headerscontent-type)
	- [Take a Look at responseType](#take-a-look-at-responsetype)
	- [License](#license)

# rext

A light-weight (< 10kb minified) request library, for all browsers (i.e. even cross-domain requests in IE 6 are possible).

| <img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/edge.png" alt="IE / Edge" width="16px" height="16px" /> IE / Edge | <img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/chrome.png" alt="Chrome" width="16px" height="16px" /> Chrome | <img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/firefox.png" alt="Firefox" width="16px" height="16px" /> Firefox | <img src="https://raw.githubusercontent.com/godban/browsers-support-badges/master/src/images/safari.png" alt="Safari" width="16px" height="16px" /> Safari |
| :---: | :---: | :---: | :---: |
| 6+ ✔ | All ✔ | All ✔ | All ✔ |

## Quick Import

Use `dist/rext.js` as a universal module ([umd](https://github.com/umdjs/umd)).

## IE 9- Support

If IE9- browsers are required to send cross-domain requests with user credentials to some target origin, define the invoker-hostname whitelist in `dist/iframe-agent.html` and put it at the root path of the origin.

For example:

Define the invoker-hostname whitelist in `iframe-agent.html`:

> Replace
> ```js
> [/* Define a whitelist of host names here, e.g. '.invoker.com'. */]
> ```
> with
> ```js
> ['.my-domain.com', '.my-domain1.com']
> ```

## API

As simple as `rext(options).success(onSuccess).error(onError)`.

Besides, the format of jQuery ajax's option object is also allowed:

```js
{
    type: 'post',
    url: '/path/to/api',
    data: {},
    contentType: 'application/json',
    dataType: 'json',
    xhrFields: {
        withCredentials: true
    },
    success: function () { /**/ },
    error: function () { /**/ },
    complete: function () { /**/ }
}
```

### XMLHttpRequest

The `success`, `error`, `always` callbacks are allowed both a chain call and defined in the option object.

```js
rext({
    url: '/path/to/resource',
    data: { /**/ }
}).success((data, response) => {
    /**/
}).error((data, response) => {
    /**/
}).always((data, response) => {
    /**/
});
```

### JSONP

The callback function is allowed either as the second parameter behind the option object or defined in the option object.

```js
rext({
    jsonp: true,
    url: '/path/to/resource',
    data: { /**/ }
}, data => {
    /**/
});
```

### a Wrapped Promise Object

The Promise object is fine. It is wrapped in an object which has a `promise` property.

To enable the Promise object, just include a `promise` property with value `true` in the option object. 

```js
var promise = rext({
    promise: true,
    url: '/path/to/resource',
    data: { /**/ }
}).then(data => {
    /**/
}).catch(data => {
    /**/
}).promise;
```

Now each method (`then` or `success`, `catch` or `error`) will return an object with a property `promise` whose value is the actual Promise object.

## Options

Instructions of the option object:

| Property | Type | Value |
| :---: | :---: | :--- |
| `type` | `{Undefined\|String}` | 'get' (default), 'post'. |
| `url` | `{String}` | The resource url string. |
| `data` | `{Undefined\|Object}` | The data to send. Object recommended. |
| `withCredentials` | `{Undefined\|Boolean}` | undefined (false, as default), true. The `withCredentials` property of the request. Whether to send user credentials with the request to another origin or not. An `xhrFields` object with `withCredentials` property of value `true` is accepted as well. |
| `agent` | `{Undefined\|Boolean}` | undefined (false, as default), true. Whether to fall back to the iframe agent directly when the request is cross-domain and the browser is IE 9-. |
| `responseType` (or `dataType`) | `{Undefined\|String}` | 'text' (default), 'json', .etc. Similar to the `dataType` option in jQuery ajax. A simple trial of JSON parsing would be conducted upon the response data besides the MIME type. See below for more. |
| `headers` | `{Undefined\|Object}` | The request headers object. Usually used to define the `Content-Type` property (similar to the `contentType` option in jQuery ajax), of which 'application/x-www-form-urlencoded' is the default value. See below for more. |
| `contentType` | `{Undefined\|String}` | The same as `headers['Content-Type']`. |
| `jsonp` | `{Undefined\|Boolean}` | undefined (false, as default), true. The same as setting `responseType` (or `dataType`) `jsonp`. |
| `promise` | `{Undefined\|Boolean\|Function}` | undefined (false, as default), true, or a Promise object constructor. Whether to use Promise object inside the returned value. |

## Case Matrix

All the cases of browser requests.

| Cross-Domain | With-Credentials | Web Browser | Approach | Restriction | Security |
| :---: | :---: | :---: | :---: | :--- | :--- |
| no | - | IE 6- | ActiveXObject | Almost the same API as the XMLHttpRequest Object. | - |
| no | - | IE 7-9 | XMLHttpRequest | [The XMLHttpRequest Object](https://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405/). | - |
| yes | no | IE 8-9 | XDomainRequest | [XDomainRequest - Restrictions, Limitations and Workarounds](https://blogs.msdn.microsoft.com/ieinternals/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds/) | - |
| no | - | IE 10-11, non-IE | XMLHttpRequest (Level 2) | [XMLHttpRequest Level 2](https://xhr.spec.whatwg.org/). IE 10-11 do not support value `json` as XHR's `responseType`, but it doesn't matter. | - |
| yes | - | IE 10-11, non-IE | XMLHttpRequest (Level 2) | Server responses should include the `Access-Control-Allow-Origin` HTTP response header with value `*`, or the exact origin of the calling page. | - |
| yes | yes | IE 10-11, non-IE | XMLHttpRequest (Level 2) | Server responses should include the `Access-Control-Allow-Origin` HTTP response header with the exact origin of the calling page, and the `Access-Control-Allow-Credentials` HTTP response header with value `true`. | - |
| - | - | - | JSONP | - | [Security concerns](https://en.wikipedia.org/wiki/JSONP#Security_concerns) |
| - | - | - | iframe agent | Be put in a specific place of the target origin. | A whitelist of visitor origins is required. |

## Take a Look at `headers['Content-Type']`

The MIME type of data to **send**, like the `contentType` in jQuery ajax.

| Value | Effect |
| :---: | :--- |
| `application/x-www-form-urlencoded` | The default, recommended. Almost the same as the url query string. |
| `multipart/form-data` | [HTML 4 specification](https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4). This allows entire files to be included in the data. Use this when the form includes any `<input type="file">` element. |
| `text/plain` | [HTML 5 specification](https://www.w3.org/TR/html5/forms.html#text/plain-encoding-algorithm). Not recommended. Do not use it unless for debugging. |
| `application/json` | **Personally** not recommended for common POST requests. Make sure you really need to post complex data with user credentials. Additionally, for CORS requests, setting the content type to anything other than `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain` will trigger the browser to send a preflight OPTIONS request to the server. |

## Take a Look at `responseType`

The alias of the expected MIME type of data to **receive**, similar to the `dataType` in jQuery ajax. This option affects the request header `Accept`, relating the response header `Content-Type`. However, **a simple trial of JSON parsing** would be conducted then regardless of the type of response data...

| Value | MIME Type |
| :---: | :--- |
| text | Default. |
| json | - |
| xml | Seldom. |
| html | Seldom. |

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-present, [shenfe](https://github.com/shenfe)

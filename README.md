# rext
A light-weight request library, for all browsers.

## Quick import

Use `rext.js` as a universal module ([umd](https://github.com/umdjs/umd)).

*If IE9- browsers are required to send cross-domain requests with user credentials to some target origin, put `iframe-agent.html` at the root path of the origin.*

## API

As simple as `rext(options).success(onSuccess).error(onError)`.

Besides, it shares the similar format of the Option object as jQuery ajax:

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

```js
rext({
    url: '/path/to/resource',
    data: { /**/ }
}).success((data, response) => {
    /**/
}).error((data, response) =>{
    /**/
}).always((data, response) =>{
    /**/
});
```

### JSONP

```js
rext({
    jsonp: true,
    url: '/path/to/resource',
    data: { /**/ }
}, data => {
    /**/
});
```

### Options

Instructions of the option object:

| Property | Value |
| :---: | :--- |
| `type` | 'get' (default), 'post'. |
| `url` | The resource url string. |
| `data` | The data to send. Object recommended. |
| `withCredentials` | false (default), true. The `withCredentials` property of the request. Whether to send use credentials with the request to another origin or not. An `xhrFields` object with `withCredentials` property of value `true` is OK as well. |
| `agent` | Whether to fallback to the iframe agent when the browser is IE 9-. |
| `responseType` (or `dataType`) | 'text' (default), 'json', .etc. Similar to the `dataType` option in jQuery ajax. A simple trial of JSON parsing would be conducted upon the response data besides the MIME type. |
| `headers` | The request headers object. Usually define the `Content-Type` property (similar to the `contentType` option in jQuery ajax), of which 'application/x-www-form-urlencoded' is the default value. |
| `contentType` | The same as `header['Content-Type']`. |
| `jsonp` | undefined (default), true. If `responseType` (or `dataType`) is set `jsonp`, this would be true as well. |

## Matrix
All the cases of requests.

| Cross-Domain | With-Credentials | Web Browser | Approach | Restriction | Security |
| :---: | :---: | :---: | :---: | :--- | :--- |
| no | - | IE 6- | ActiveXObject | Almost the same API as the XMLHttpRequest Object. | - |
| no | - | IE 7-9 | XMLHttpRequest | [The XMLHttpRequest Object](https://www.w3.org/TR/2006/WD-XMLHttpRequest-20060405/). | - |
| yes | no | IE 8-9 | XDomainRequest | [XDomainRequest - Restrictions, Limitations and Workarounds](https://blogs.msdn.microsoft.com/ieinternals/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds/) | - |
| no | - | IE 10-11, non-IE | XMLHttpRequest (Level 2) | [XMLHttpRequest Level 2](https://xhr.spec.whatwg.org/). However IE 10-11 do not support value `json` as XHR's `responseType`. | - |
| yes | - | IE 10-11, non-IE | XMLHttpRequest (Level 2) | Server responses should include the `Access-Control-Allow-Origin` HTTP response header with value `*`, or the exact origin of the calling page. | - |
| yes | yes | IE 10-11, non-IE | XMLHttpRequest (Level 2) | Server responses should include the `Access-Control-Allow-Origin` HTTP response header with the exact origin of the calling page, and the `Access-Control-Allow-Credentials` HTTP response header with value `true`. | - |
| - | - | - | JSONP | - | [Security concerns](https://en.wikipedia.org/wiki/JSONP#Security_concerns) |
| - | - | - | iframe agent | - | - |

## `headers['Content-Type']`

The MIME type of data to send, like the `contentType` in jQuery ajax.

| Value | Effect |
| :---: | :--- |
| `application/x-www-form-urlencoded` | The default, recommended. Almost the same as the url query string. |
| `multipart/form-data` | [HTML 4 specification](https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4). This allows entire files to be included in the data. Use this when the form includes any `<input type="file">` element. |
| `text/plain` | [HTML 5 specification](https://www.w3.org/TR/html5/forms.html#text/plain-encoding-algorithm). Not recommended. Do not use it unless for debugging. |
| `application/json` | Personally not recommended for common POST requests. Use it only if you really need to post complex data with user credentials. Besides, for CORS requests, setting the content type to anything other than `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain` will trigger the browser to send a preflight OPTIONS request to the server. |

## `responseType`

The alias of the expected MIME type of data to receive, similar to the `dataType` in jQuery ajax. This option affects the request header `Accept`, relating the response header `Content-Type`. However, **a simple trial of JSON parsing** would be conducted then regardless of the type of response data...

| Value | MIME Type |
| :---: | :--- |
| text | Default. |
| json | - |
| xml | Seldom. |
| html | Seldom. |

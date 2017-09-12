# rext
A light-weight request library, for all browsers.

## Quick import

Use `rect.js` as a universal module ([umd](https://github.com/umdjs/umd)).

*If IE9- browsers are required to send cross-domain requests with user credentials to some target origin, put `iframe-agent.html` at the root path of the origin.*

## API

As simple as `rext(options).success(onSuccess).error(onError)`.

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
| jsonp | undefined (default), true. |
| type | 'get' (default), 'post'. |
| url | The resource url string. |
| data | The data to send. Object recommended. |
| withCredentials | false (default), true. The `withCredentials` property of the request. |
| responseType | 'text' (default), 'json', .etc. Like the `dataType` in jQuery ajax. |
| headers | The request headers object. Usually define the `Content-Type` property (like the `contentType` in jQuery ajax), of which 'application/x-www-form-urlencoded' is the default value. |

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

The MIME type of data to send.

| Value | Effect |
| :---: | :--- |
| `application/x-www-form-urlencoded` | The default, recommended. Almost the same as the url query string. |
| `multipart/form-data` | [HTML 4 specification](https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4). This allows entire files to be included in the data. Use this when the form includes any `<input type="file">` element. |
| `text/plain` | [HTML 5 specification](https://www.w3.org/TR/html5/forms.html#text/plain-encoding-algorithm). Not recommended. Do not use it unless for debugging. |
| `application/json` | Not recommended. For CORS requests, setting the content type to anything other than application/x-www-form-urlencoded, multipart/form-data, or text/plain will trigger the browser to send a preflight OPTIONS request to the server. |

## `responseType`

The alias of the expected MIME type of data to receive. This option affects the request header `Accept`, relating the response header `Content-Type`.

| Value | MIME Type |
| :---: | :--- |
| text | Default, recommended. |
| json | Recommended. |
| xml | - |
| html | - |
| script | - |
| jsonp | - |

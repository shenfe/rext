# rext
A light-weight request library, for all browsers.

## Matrix
All the cases of requests.

| Cross-Domain | With-Credentials | Web Browser | Approach | Restriction | Security |
| :---: | :---: | :---: | :---: | :--- | :--- |
| no | - | IE 6- | ActiveXObject | Almost the same API as the XMLHttpRequest Object. | - |
| no | - | IE 7-9 | XMLHttpRequest | The XMLHttpRequest Object. | - |
| yes | no | IE 8-9 | XDomainRequest | [XDomainRequest - Restrictions, Limitations and Workarounds](https://blogs.msdn.microsoft.com/ieinternals/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds/) | - |
| no | - | IE 10-11, non-IE | XMLHttpRequest (Level 2) | XMLHttpRequest Level 2. However IE 10-11 do not support value `json` as XHR's `responseType`. | - |
| yes | - | IE 10-11, non-IE | XMLHttpRequest (Level 2) | Server responses should include the `Access-Control-Allow-Origin` HTTP response header with value `*`, or the exact origin of the calling page. | - |
| yes | yes | IE 10-11, non-IE | XMLHttpRequest (Level 2) | Server responses should include the `Access-Control-Allow-Origin` HTTP response header with the exact origin of the calling page, and the `Access-Control-Allow-Credentials` HTTP response header with value `true`. | - |
| - | - | - | JSONP | - | [Security concerns](https://en.wikipedia.org/wiki/JSONP#Security_concerns) |
| - | - | - | iframe agent | - | - |

## `contentType`

The type of data to send. This option affects the request header `Content-Type`.

| Value | Effect |
| :---: | :--- |
| `application/x-www-form-urlencoded` (default) | - |
| `multipart/form-data` | - |
| `text/plain` | - |
| `application/json` | For cross-domain requests, setting the content type to anything other than application/x-www-form-urlencoded, multipart/form-data, or text/plain will trigger the browser to send a preflight OPTIONS request to the server. |

## `dataType`

The type of data to receive. This option affects the request header `Accept`, thus affects the response header `Content-Type`.

| Value | Effect |
| :---: | :--- |
| xml | - |
| html | - |
| script | - |
| json | - |
| jsonp | - |
| text | - |

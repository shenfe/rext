# rext
Send requests.

## Matrix

| Cross-Domain | With-Credentials | Web Browser | Approach | Restriction |
| :---: | :---: | :---: | :---: | :---: |
| no | - | IE6 | ActiveXObject | - |
| no | - | IE7-9 | XMLHttpRequest | - |
| yes | - | IE7- | iframe | - |
| yes | yes | IE8-9 | iframe | - |
| yes | no | IE8-9 | XDomainRequest | - |
| no | - | IE10-11, non-IE | XMLHttpRequest | - |
| yes | - | IE10-11, non-IE | XMLHttpRequest | - |

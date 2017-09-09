# rext
Send requests.

## Matrix

| Cross-Domain | With-Credentials | Web Browser | Approach | Restriction |
| :---: | :---: | :---: | :---: | :---: |
| no | - | IE6 | ActiveXObject | - |
| no | - | IE7-9 | XMLHttpRequest | - |
| yes | - | IE7- | iframe | - |
| yes | no | IE8-9 | XDomainRequest | - |
| yes | yes | IE8-9 | iframe | - |
| no | - | IE10-11, non-IE | XMLHttpRequest | - |
| yes | no | IE10-11, non-IE | XMLHttpRequest | - |
| yes | yes | IE10-11, non-IE | XMLHttpRequest | - |

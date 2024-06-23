# Xray + Argo for Express.js PaaS

Argo connects various services to connect millions of users on platforms without public networks. --- Born for the JS platform

* * *

# Table of Contents

- [Project Features](README.md#Project Features)
- [Deployment](README.md#Deployment)
- [Deployment Highlights in Glitch](README.md#Deployment Highlights in-glitch)
- [Deployment Highlights in Daki](README.md#Deployment Highlights in-daki)
- [Deployment of ttyd webssh / filebrowser webftp](README.md#Deployment of ttyd-webssh--filebrowser-webftp)
- [Thanks to the following authors for their articles and projects](README.md#Thanks to the following authors for their articles and projects)
- [Disclaimer](README.md#Disclaimer)

* * *

## Project Features:
* This project is used to deploy Xray on the Express.js PaaS platform, using the Argo + Xray + WebSocket + TLS solution
* Unlock ChatGPT
* View system information in the browser, convenient and intuitive
* Use CloudFlare Argo tunnel, directly select + tunnel, CDN no longer needs to be workers
* Backflow and diversion, support Xray's 4 mainstream protocols: vless / vmess / trojan / shadowsocks
* vmess and vless uuid, trojan and shadowsocks password, ws path of each protocol can be customized or use the default value
* Integrate Nezha probe, you can freely choose whether to install
* Front-end js timed keep alive, users who know how to play can modify the interval time according to specific circumstances
* Node information is output in V2rayN / Clash / Little Rocket link mode
* Xray file recompiles official file to increase confidentiality, and modifies the display information at runtime. The file is: https://github.com/XTLS/Xray-core/blob/main/core/core.go
* You can use webssh and webftp with a browser, which is more convenient for managing the system

<img width="718" alt="image" src="https://user-images.githubusercontent.com/92626977/215277537-ff358dc1-7696-481f-b8e4-74f0cdff30f4.png">

## Deployment:

### Variables used by the PaaS platform:

* Modify the username and password for querying the web page in lines 1 and 2 of the `server.js` file
| Variable name | Required | Default value | Remarks |
| ------------ | ------ | ------ | ------ |
| WEB_USERNAME | Yes | admin | Username of the web page |
| WEB_PASSWORD | Yes | password | Password of the web page |

<img width="939" alt="image" src="https://user-images.githubusercontent.com/92626977/221387298-4183a1d6-ae14-45f9-b498-1789a4f7117e.png">

* Modify the first 4-15 lines of the `entrypoint.sh` file; the authentication of accessing the page is modified in the 1st and 2nd lines of the `server.js` file. Required
| Variable name | Required | Default value | Remarks |
| ------------ | ------ | ------ | ------ |
| UUID | No | de04add9-5c68-8bab-950c-08cd5320df18 | Can be generated online https://www.zxgj.cn/g/uuid |
| WSPATH | No | argo | Do not start with /, the protocol path is `/WSPATH-protocol`, such as `/argo-vless`,`/argo-vmess`,`/argo-trojan`,`/argo-shadowsocks` |
| NEZHA_SERVER | No | | IP or domain name of the Nezha probe server |
| NEZHA_PORT | No | | Port of the Nezha probe server |
| NEZHA_KEY | No | | Nezha probe client-specific key |
| NEZHA_TLS | No | | Whether to enable SSL/TLS encryption for the Nezha probe. If not, please delete it. If you want to enable it, fill in "1" |
| ARGO_AUTH | No | | Argo's token or json value. The json value can be easily obtained from the following website without binding a card: https://fscarmen.cloudflare.now.cc/ |
| ARGO_DOMAIN | No | | Argo's domain name. It must be filled in together with ARGO_DOMAIN to take effect |
| SSH_DOMAIN | No | | The domain name, username and password of webssh are <WEB_USERNAME> and <WEB_PASSWORD> |
| FTP_DOMAIN | No | | The domain name, username and password of webftp are <WEB_USERNAME> and <WEB_PASSWORD> |

<img width="1301" alt="image" src="https://user-images.githubusercontent.com/92626977/226095672-ecbfc8e7-80f3-4821-abb4-df75c4ece483.png">

* js to be applied
| Command | Description |
| ---- |------ |
| <URL>/list | View node data |
| <URL>/status | View background process |
| <URL>/listen | View background listening port |
| <URL>/test | Test whether it is a read-only system |

## Deployment highlights in Glitch

Here we only show the highlights, for more details, please refer to the project: https://github.com/fscarmen2/X-for-Glitch

<img width="1105" alt="image" src="https://user-images.githubusercontent.com/92626977/214567653-768f4f91-13b5-4205-9118-f5510081e260.png">

<img width="1680" alt="image" src="https://user-images.githubusercontent.com/92626977/215279773-d550494e-647b-42e8-b5dc-5d32679fbf9e.jpg">

<img width="322" alt="image" src="https://user-images.githubusercontent.com/92626977/214568380-b07dd83b-a4d6-43fe-9ead-79f1393e909c.png">

## Deployment highlights in Daki

<img width="1198" alt="image" src="https://user-images.githubusercontent.com/92626977/212642015-e84e07de-9f07-466d-b446-8cd8431e7220.png">

<img width="1198" alt="image" src="https://user-images.githubusercontent.com/92626977/212642096-dfcce6d1-d6b2-4b55-9b94-995e5561ac44.png">

<img width="1198" alt="image" src="https://user-images.githubusercontent.com/92626977/212642206-6b12179d-b35a-4a1e-b4e1-963b537c7693.png">

<img width="1547" alt="image" src="https://user-images.githubusercontent.com/92626977/214568691-54cc283b-614f-4fe7-8782-c48ed46cff31.png">

<img width="1664" alt="image" src="https://user-images.githubusercontent.com/92626977/214580345-765231a7-ec63-4564-a188-ceae28308258.png">

<img width="1137" alt="image" src="https://user-images.githubusercontent.com/92626977/215279783-0400e80e-83be-4142-8592-2385c54e36e6.jpg">

<img width="322" alt="image" src="https://user-images.githubusercontent.com/92626977/214580604-8d4f6454-3b78-41a9-b765-cff714b85638.png">

## ttyd webssh / filebrowser webftp deployment

* Principle
```
+---------+ argo +---------+ http +--------+ ssh +-----------+
| browser | <==========> | CF edge | <==========> | ttyd | <=======> | ssh server|
+---------+ argo +---------+ websocket +--------+ ssh +-----------+

+---------+ argo +---------+ http +--------------+ ftp +-----------+
| browser | <==========> | CF edge | <=========> | filebrowser | <=======> | ftp server|
+---------+ argo +---------+ websocket +--------------+ ftp +-----------+

```

* Tunnel built using Json method

<img width="1643" alt="image" src="https://user-images.githubusercontent.com/92626977/235453084-a8c55417-18b4-4a47-9eef-ee3053564bff.png">

<img width="1303" alt="image" src="https://github.com/fscarmen2/aa/assets/92626977/652ef3ff-c9a9-4771-92c8-bab6c516abeb">

<img width="1001" alt="image" src="https://github.com/fscarmen2/aa/assets/92626977/5b5e0143-ba5a-4b6a-a7fd-e77ef9d0703e">

<img width="1527" alt="image" src="https://github.com/fscarmen2/rrr/assets/92626977/91cece0d-cc61-4681-8eae-03f961a16976">

## Thanks to the following authors for their articles and projects:
* The front-end JS is based on the project of Nike Jeff, and is modified for universality and extended functions, https://github.com/hrzyang/glitch-trojan
* The back-end is all original, and the source must be indicated if reproduced.

## Disclaimer:
* This program is for learning and understanding only, not for profit, please delete it within 24 hours after downloading, It cannot be used for any commercial purpose. The text, data and pictures are all copyrighted. If reproduced, the source must be indicated.
* The use of this program must comply with the deployment disclaimer. The use of this program must comply with the laws and regulations of the deployment server location, the country where it is located and the country where the user is located. The program author is not responsible for any improper behavior of the user.

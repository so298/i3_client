# WebRTCについて
WebRTC(Web Real Time Communication)とは、ブラウザ上での映像通信など、
リアルタイム性の高い通信をPeer To Peerで行うためのプロトコルです。
内部の通信ではUDPを利用しています。

## Peer to peer (p2p) 通信とは
サーバーを介さずに、通信をクライアント間のみで行う通信方式です。
WebRTCの場合、後述する通信を確立するための情報(SDP, ICE)のやり取り
のみでサーバーとの通信を行い、通信が確立して以降はP2Pで通信を行います。

## どのようにして通信を確立しているのか
SDP(Session Description Protocol)とICE Candidate(Interactive connectivity establishment)
という情報をやり取りし、その情報を使うことで通信を行っています。

### SDPに含まれる情報
ブラウザ間でやり取りするコンテンツの解像度・フォーマット、暗号化の形式などの情報が含まれます。

#### 実際のSession Descriptionの一例
以下は今回作成したアプリケーションで実際にやり取りされていたSession Descriptionを抜粋したものです。(実際にはより多くの情報をやり取りしています)

```
v=0
o=- 4514753741843204085 3 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0
a=extmap-allow-mixed
a=msid-semantic: WMS O3QxEb1jlvyvcyvrkowl9YubGohZRfXA4fgK
m=video 16423 UDP/TLS/RTP/SAVPF 96 97 98 99 100 101 127 121 125 107 108 109 124 120 123 119 35 36 41 42 114 115 116 117 118
c=IN IP4 106.73.166.34
a=rtcp:9 IN IP4 0.0.0.0
a=candidate:3955775920 1 udp 2122194687 192.168.10.117 60616 typ host generation 0 network-id 3
a=rtpmap:41 AV1/90000
```

### ICEに含まれる情報
ウェブブラウザ間で直接通信する際に障害となるファイアウォールなどを回避するための情報を含んでいます。

ICEの情報はSession Descriptionの中に埋め込んで送信することができます。

## 何を実装したのか
上記のSDPの生成とICEの取得の方法はブラウザがすでに提供してくれています。

自分たちが実装したのはそれらの情報をやり取りするためのシグナリングという作業の部分です。

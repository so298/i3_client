# I3 client

このリポジトリは東京大学工学部電子情報工学科・電気電子工学科の
[I3実験](https://sites.google.com/view/i1i2i3/)
の発展課題として作成したアプリケーションのクライアントのリポジトリです。

バックエンドは[こちら](https://github.com/koppe-pan/I3-backend)

## 起動方法
`yarn`コマンドを利用できるようにしてください。そのうえで、

```
$ yarn install
$ yarn start
```

を実行することでクライアントのサーバーを起動できます。

WebRTCを利用して通信を始めるためにはシグナリングサーバーも起動する必要があります。
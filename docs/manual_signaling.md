# 手動シグナリングによるコネクション確立
ソースコード`src/pages/ManualSignaling.tsx`の説明です

# 手動シグナリングの概要

手動シグナリングでは、iceやsdpの情報をサーバーを通さずにコピペで伝えます。
注意点としては、createOfferやcreateAnswerを呼び出す回数が一度だけだと
sdpにiceの情報が載らないので通信が確立しません。
それを防ぐために、手動シグナリングでは一度createOfferを呼び出したあとに、
iceの情報を収集し終わったあとにもう一度createOffer -> setLocalDescriptionを
行い、sdpの情報をアップデートしています。

## 手動シグナリングで詰まったところ
- onicecandidateでiceの収集が終了する前にcreateOfferをしてしまっていたので通信が成功しなかった
  - とりあえずは２回createOfferを行えば解決
  - trickle ICEのほうがいい？

# Wmap-Anycsv

[LinkData.org](http://linkdata.org)のデータセット、ならびに自治体等が公開しているCSV/TSVファイル(外部CSV/TSVファイル)を直接扱えるGulpプラグインを同梱した[Wmap](https://github.com/wakayama-hacker/wmap) 改良版です。

## 使い方

基本的な使い方は[Wmap](https://github.com/wakayama-hacker/wmap) と同じです。
LinkData.org、外部CSV/TSVファイルを使う場合のみ、各設定ファイルへの記述が必要です。

```
$ npm install
$ npm run build
$ npm start
```

### Wmap CSV仕様

|menu|title|lat|lng|content|
|----|-----|---|---|-------|
|串本|橋杭岩|33.488547|135.795751|これは橋杭岩です。|
|串本|潮岬|33.437084|135.755906|本州最南端の潮岬です。|
|白浜|円月島|33.690140|135.337222|円月島です。|

上記が、Wmap CSV仕様です。 menu は Wmap のカテゴリ、 lat は緯度、lng は経度の値、titleとcontent には、データのタイトルと概要の文字列が入りいます。

### LinkData.org の場合

`data/linkdata.dataset` にLinkData.org のデータセットの設定をCSV形式で記述することにより、Wmap内でそのデータを利用することができます。

|カラム名| 入力データ|
|:---|:---|
|dataset|データセットID(例:rdf1s4805i)|
|filename | ファイル名(例:takatsuki_city_vaccination_trust_hospital)|
|menu | WmapのCSV仕様「menu」に該当するデータのカラム名、または、menuに指定したい文字列|
|content | WmapのCSV仕様「content」に該当するデータのカラム名|
|title | WmapのCSV仕様「title」に該当するデータのカラム名|
|lat | WmapのCSV仕様「lat」に該当するデータのカラム名|
|lng |WmapのCSV仕様「lng」に該当するデータのカラム名|

##### データ例：
```
dataset,filename,menu,content,title,lat,lng
rdf1s3569i,takatsuki_city_culturalfacilities,施設情報,address,label,lat,long
```

##### LinkData.org のデータセットを使用したデモ：
<http://uedayou.net/wmap-linkdata-demo/>

### 外部CSV/TSVファイルの場合

`data/anycsv.dataset` に自治体等で公開されているCSV/TSVファイルのURLとそのデータの設定をCSV形式で記述することで、Wmap内でそのデータを利用することができます。なお、CSV/TSVは、ファイル拡張子(.csv/.tsv)により自動的に判定します。

|カラム名| 入力データ|
|:---|:---|
|url | CSV/TSVファイルのURL |
|menu | WmapのCSV仕様「menu」に該当するデータのカラム名、または、menuに指定したい文字列 |
|content | WmapのCSV仕様「content」に該当するデータのカラム名 |
|title | WmapのCSV仕様「title」に該当するデータのカラム名 |
|lat | WmapのCSV仕様「lat」に該当するデータのカラム名 |
|lng | WmapのCSV仕様「lng」に該当するデータのカラム名 |

##### データ例：
```
url,menu,content,title,lat,lng
https://raw.githubusercontent.com/wakayama-pref-org/land_prices_survey_h28/master/CSV/Land_prices_survey_H28.csv,"地価調査・地価公示の別","所在（大字以降）","基準地番号・標準地番号（最新年）","緯度（世界測地系）","経度（世界測地系）"
http://www.city.osaka.lg.jp/contents/wdu090/opendata/mapnavoskdat_csv/mapnavoskdat_kankouchou.csv,"カテゴリ","所在地","施設名",Y,X
```
##### 外部CSVを使用したデモ：
<http://uedayou.net/wmap-anycsv-demo/>

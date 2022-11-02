# Wantedly 自動応援ツール

Wantedly の各募集要項を自動で応援します。

## 前提

node.js、google chrome が入っていることが前提です。

未インストールであれば、こちらからインストールしてください。

https://nodejs.org/en/download/

また、Mac で動作確認していますが、他で動くかは保証できません。

Chrome が最新バージョンにアップデートされているかも確認して下さい

## 使い方

### 1. このリポジトリをクローンして、以下のコマンドでセットアップしてください。

```
$ git clone https://github.com/nao0515ki/Wantedly-auto-ouen.git
$ cd Wantedly-auto-ouen
$ sudo npm install -g selenium-webdriver
$ sudo npm install -g chromedriver
$ yarn install
```

※$マークは不要

### 2. CSV ファイルを変更し、応援したい募集要項や自分のアカウントを設定してください。

すでに記載してあるものは例なので消して大丈夫。一番上の行だけ消さないで。

Facebook アカウントの場合は Wantedly の設定でパスワードを設定してからそのパスワードを登録しないとできない。

応援したい募集要項は`pages.*`に追加

応援したいアカウントは`accounts.csv`に追加

### 3. 設定が完了したら、下記コマンドを実行してください。

```
$ node auto-ouen.js
```

### 4. セットアップ後、Chrome ブラウザを更新すると chromedriver の更新も必要になります。

```
This version of ChromeDriver only supports Chrome version
```

上記のようなエラーが出ている場合、chromedriver が古いバージョンです。

下記コマンドを実行して chromedriver を更新してください。

```
$ npm install chromedriver@latest -g
```

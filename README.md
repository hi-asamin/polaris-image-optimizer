# polaris-api

## Build & Deploy 手順

### Build

プロジェクトの ルートディレクトリに移動し、zip 圧縮コマンドを実行する

```sh
$ cd polaris-image-optimizer
$ zip -r function.zip .
```

### Deploy

deployment.zip を AWS Lambda に手動デプロイする

1. [Lambda](https://ap-northeast-1.console.aws.amazon.com/lambda/home?region=ap-northeast-1#/functions/image-optimizer)にアクセスする
2. コードソースの「アップロード元」ボタンを押下し、「.zip ファイル」を選択する
3. 「アップロード」ボタンで`function.zip`を選択し、保存する

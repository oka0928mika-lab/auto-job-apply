# 自動案件応募・返信通知

クラウドワークスとココナラの案件を5分ごとに確認し、設定条件に合う案件へ応募するための仕組みです。返信がある場合のみ、指定した個人LINEへ通知します。

## 安全設計

- 初期状態は `LIVE_APPLY=false` 相当で、自動応募しません。
- GitHub Secretsが未設定の媒体は処理を行いません。
- 同じ案件に「応募済み」「提案済み」の表示がある場合は再応募しません。
- 発注者評価4.5未満、本人確認未完了、低評価レビューが2件以上ある案件は除外します。
- 無償テスト、仮払い前の作業、外部LINE誘導などを含む案件は除外します。

## 必要なSecrets

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_USER_ID`
- `CROWDWORKS_STORAGE_STATE_B64`
- `COCONALA_STORAGE_STATE_B64`
- `PROFILE_JSON_B64`

値は公開ファイルやIssueに記載せず、必ずGitHubの Settings → Secrets and variables → Actions から登録します。

## 有効化

動作確認後、Repository variable `LIVE_APPLY` を `true` にすると応募処理が有効になります。

## 注意

各媒体に公式の応募APIがないため、画面変更、再ログイン要求、CAPTCHA等で停止する場合があります。また、自動操作の可否について各媒体の運営へ確認したうえで利用してください。

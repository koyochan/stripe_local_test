# 🛒 Stripe + Firebase Integration

このプロジェクトは、**Stripe Checkout** と **Firebase Firestore** を活用してシンプルな決済フローを実現したアプリケーションです。  
以下にアプリの機能、技術スタック、必要なコマンド、セットアップ手順などを説明します。

---

## 📚 特徴

1. **決済フロー**
   - Stripe Checkoutを通じて商品の購入を行います。
   - 一定数以上の購入で「おまけチケット」を付与するロジックを実装（例: 10枚で1枚、20枚で2枚）。

2. **Webhook 処理**
   - StripeのWebhooksを利用して、購入完了後にFirebase Firestore内のユーザーデータを更新。
   - Firestoreの特定のユーザーのチケット枚数をインクリメント。

3. **静的ファイル提供**
   - `public` フォルダ内のHTMLファイルを使って以下の画面を提供します:
     - `/`: 購入画面
     - `/success`: 決済成功時の確認画面
     - `/cancel`: 決済キャンセル時の画面

4. **環境変数を利用したセキュリティ**
   - `.env` ファイルを用いて以下のキーを管理:
     - Stripeの公開鍵・秘密鍵（`STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`）
     - Stripe Webhookシークレット（`STRIPE_ENDPOINT_SECRET`）

5. **柔軟なWebhookエンドポイントの処理**
   - Stripeの署名検証機能（`stripe.webhooks.constructEvent`）を利用して、不正リクエストを防止。

---

## 🛠 技術スタック

- **Node.js**: サーバーサイドの実行環境
- **Express**: 軽量なWebフレームワーク
- **Firebase**:
  - **Cloud Firestore**: データベース管理
- **Stripe**:
  - WebhookやCheckoutセッションを使用した決済機能
- **dotenv**: 環境変数管理
- **body-parser**: HTTPリクエストのボディ解析
- **firebase-admin**: Firebase Admin SDK
- **stripe**: Stripe APIとの連携
- **path**: ファイル/ディレクトリパスの操作

---

## 🔧 ファイル構造

```plaintext
├── .env                       // 環境ファイル
├── .gitignore
├── app.js
├── firebase_service_key.json  // Firebaseサービスアカウントキー
├── package-lock.json
├── package.json
├── public                     // 静的ファイル
│   ├── cancel.html
│   ├── index.html
│   └── success.html
└── server.js
```
## 🚀 必要なコマンド一覧と設定方法

1. **Stripeにログイン**
```stripe login```

2. **サーバーを起動**
```node server.js```

3. **StripeのWebhookをローカルサーバーに転送**
```stripe listen --forward-to http://localhost:4242/webhook```

4. **Stripeのプロダクト一覧を確認**
```stripe products list```

5. **Stripeの価格一覧を確認**
```stripe prices list```

---

## ⚙️ 環境変数の設定 (`.env` ファイル)
以下の内容を `.env` ファイルに記述してください。
```
STRIPE_PUBLISHABLE_KEY=pk_test_*****************************
STRIPE_SECRET_KEY=sk_test_*****************************
STRIPE_ENDPOINT_SECRET=whsec_*****************************
```

💻 実行画面

購入画面

<img width="1468" alt="購入画面" src="https://github.com/user-attachments/assets/e783be15-6e42-461e-99fa-767fb299695f" />


決済画面 (Checkout画面)

<img width="1468" alt="決済画面" src="https://github.com/user-attachments/assets/b76cad65-dda9-4485-b406-4ddb674d50bb" />


決済成功画面 (Success画面)

<img width="1468" alt="決済成功画面" src="https://github.com/user-attachments/assets/ec395d70-a0cb-4087-a741-99f65836acaf" />


決済失敗/キャンセル画面 (Cancel画面)

<img width="1469" alt="決済キャンセル画面" src="https://github.com/user-attachments/assets/9cf13919-2dfa-40f5-92f8-84ec1423f431" />


Firestore画面

<img width="1117" alt="Firestore画面" src="https://github.com/user-attachments/assets/c87be83c-ce41-49b4-8773-27f93a1c8efb" />
```


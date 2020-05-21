# @suin/gatsby-source-esa

Gatsbyにesa.ioのデータを提供するソースプラグイン。esa API v1を使用してデータを取り込みます。

現在は、投稿の取得のみ対応しています。

## インストール

```bash
yarn add @suin/gatsby-source-esa
# or
npm install @suin/gatsby-source-esa
```

## 使い方

### 設定の仕方

gatsby-config.jsのプラグイン設定に@suin/gatsby-source-esaを追加してください:

```javascript
// gatsby-config.js
module.exports = {
  // ...
  plugins: [
    {
      resolve: `@suin/gatsby-source-esa`,
      options: {
        team: `foo`,
        token: process.env.ESA_TOKEN,
        posts: {
          q: `wip:false in:Public`,
          include: [`comments`, `stargazers`],
          sort: `number`,
          order: `asc`,
        },
      },
    },
    // ...
  ],
}
```

__オプション__

* `team`: https://{チーム名}.esa.io の {チーム名} の部分を指定する。
* `token`: ユーザの管理画面(https://[team].esa.io/user/tokens)で発行したアクセストークンを指定する。
* `posts`: エンドポイント [GET /v1/team/:team_name/postsのURIクエリ文字列](https://docs.esa.io/posts/102#URI%E3%82%AF%E3%82%A8%E3%83%AA%E6%96%87%E5%AD%97%E5%88%97-1) に指定できるパラメータが利用可能。
    * `posts.q`: 記事を絞り込むための条件。ここに検索オプション(wip:falseやin:Publicなど)を駆使して、公開すべき記事をうまく絞り込むことをおすすめをします。[help/記事の検索方法 - docs.esa.io](https://docs.esa.io/posts/104)参照。

### クエリー

GraphQLでのクエリーは以下のように行なえます:

```graphql
query MyQuery {
  allEsaPost {
    edges {
      node {
        number
        name
        body_md
        body_html
        category
        tags
        created_at
        updated_at
      }
    }
  }
}
```

__提供されるGraphQLインターフェイス__

* allEsaPost: すべての投稿
* allEsaPostBodyHtml: すべての投稿の本文のHTML部分
* allEsaPostBodyMarkdown: すべての投稿の本文のMarkdown部分
* esaPost
* esaPostBodyHtml
* esaPostBodyMarkdown

## 注意事項

* esa APIには「ユーザ毎に15分間に75リクエストまで」という利用制限があります。このプラグインはできるだけリクエスト数が少なくなるように設計してありますが、この利用制限に達した場合の挙動は未定義です。

## Tips

### gatsby-transformer-remarkとの統合

MarkdownファイルをパースするGatsbyプラグインの [gatsby-transformer-remark](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) とは自動的に統合されます。下記のように、当プラグインとgatsby-transformer-remarkを併用するだけです:

```javascript
// gatsby-config.js
module.exports = {
  // ...
  plugins: [
    {
      resolve: `@suin/gatsby-source-esa`,
      options: {
        team: `foo`,
        token: process.env.ESA_TOKEN,
        posts: { /*...*/ },
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: { /*...*/ },
    },
    // ...
  ],
}
```

### 複数のチームをデータソースにする場合

このプラグインは複数のesaチームをデータソースにしても、それぞれのチームの投稿がGatsby上で衝突しないように設計されています。

複数のチームからデータを取り込む場合は、下記のように`@suin/gatsby-source-esa`を複数記述してください。

```javascript
// gatsby-config.js
module.exports = {
  // ...
  plugins: [
    {
      resolve: `@suin/gatsby-source-esa`,
      options: {
        team: `foo`,
        token: process.env.ESA_FOO_TOKEN,
      },
    },
    {
      resolve: `@suin/gatsby-source-esa`,
      options: {
        team: `bar`,
        token: process.env.ESA_BAR_TOKEN,
      },
    },
    // ...
  ],
}
```

GraphQLでチーム名を参照するには、`team`をクエリに含めてください:

```graphql
query MyQuery {
  allEsaPost {
    edges {
      node {
        team # ここ
        name
        body_md
        # ....
      }
    }
  }
}
```

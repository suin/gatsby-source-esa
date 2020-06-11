# @suin/gatsby-source-esa

Gatsby に esa.io のデータを提供するソースプラグイン。esa API v1 を使用してデータを取り込みます。

現在は、投稿の取得のみ対応しています。

## 特徴

- esa のデータソースに対応
  - 記事
- TypeScript サポート
  - GraphQL の[スキーマを定義している](./lib/createSchemaCustomization.ts)ので、[gatsby-plugin-graphql-codegen]が生成する TypeScript 型定義がしっかりしています。
- 複数の esa チームをデータソースに指定できる
- 下記の gatsby プラグインとの統合をサポート
  - gatsby-transformer-remark
  - gatsby-transformer-rehype

[gatsby-plugin-graphql-codegen]: https://www.gatsbyjs.org/packages/gatsby-plugin-graphql-codegen/

## インストール

```bash
yarn add @suin/gatsby-source-esa
# or
npm install @suin/gatsby-source-esa
```

## 使い方

### 設定の仕方

gatsby-config.js のプラグイン設定に@suin/gatsby-source-esa を追加してください:

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

**オプション**

- `team`: https://{チーム名}.esa.io の {チーム名} の部分を指定する。
- `token`: ユーザの管理画面(https://[team].esa.io/user/tokens)で発行したアクセストークンを指定する。
- `posts`: エンドポイント [GET /v1/team/:team_name/posts の URI クエリ文字列](https://docs.esa.io/posts/102#URI%E3%82%AF%E3%82%A8%E3%83%AA%E6%96%87%E5%AD%97%E5%88%97-1) に指定できるパラメータが利用可能。
  - `posts.q`: 記事を絞り込むための条件。ここに検索オプション(wip:false や in:Public など)を駆使して、公開すべき記事をうまく絞り込むことをおすすめをします。[help/記事の検索方法 - docs.esa.io](https://docs.esa.io/posts/104)参照。

### クエリー

GraphQL でのクエリーは以下のように行なえます:

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

**提供される GraphQL インターフェイス**

- allEsaPost: すべての投稿
- allEsaPostBodyHtml: すべての投稿の本文の HTML 部分
- allEsaPostBodyMarkdown: すべての投稿の本文の Markdown 部分
- esaPost
- esaPostBodyHtml
- esaPostBodyMarkdown

## 注意事項

- esa API には「ユーザ毎に 15 分間に 75 リクエストまで」という利用制限があります。このプラグインはできるだけリクエスト数が少なくなるように設計してありますが、この利用制限に達した場合の挙動は未定義です。

## Tips

### gatsby-transformer-remark との統合

Markdown ファイルをパースする Gatsby プラグインの [gatsby-transformer-remark](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/) とは自動的に統合されます。下記のように、当プラグインと gatsby-transformer-remark を併用するだけです:

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
          /*...*/
        },
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        /*...*/
      },
    },
    // ...
  ],
}
```

### gatsby-transformer-rehype との統合

HTML ファイル(mediaType が text/html)のノードを変形する Gatsby プラグインの [gatsby-transformer-rehype](https://www.gatsbyjs.org/packages/gatsby-transformer-rehype/) とは自動的に統合されます。下記のように、当プラグインと gatsby-transformer-rehype を併用するだけです。

gatsby-transformer-rehype には記事ノードの`body_html`が渡ります。

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
          /*...*/
        },
      },
    },
    {
      resolve: `gatsby-transformer-rehype`,
      options: {
        /*...*/
      },
    },
    // ...
  ],
}
```

gatsby-transformer-rehype で処理された HTML を取り出すには、次のようなクエリーを発行します:

```graphql
query MyQuery {
  allEsaPost {
    edges {
      node {
        number
        name
        childrenEsaPostBodyHtml {
          childHtmlRehype {
            html
          }
        }
      }
    }
  }
}
```

結果の例:

```json
{
  "data": {
    "allEsaPost": {
      "edges": [
        {
          "node": {
            "number": 123,
            "name": "...",
            "childrenEsaPostBodyHtml": [
              {
                "childHtmlRehype": {
                  "html": "<p>..."
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

### 複数のチームをデータソースにする場合

このプラグインは複数の esa チームをデータソースにしても、それぞれのチームの投稿が Gatsby 上で衝突しないように設計されています。

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

GraphQL でチーム名を参照するには、`team`をクエリに含めてください:

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

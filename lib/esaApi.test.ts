import MockAdapter from 'axios-mock-adapter'
import { EsaApi, PostsPayload, Post } from './esaApi'

describe('esaApi', () => {
  let api: EsaApi
  let mock: MockAdapter

  beforeEach(() => {
    api = new EsaApi({
      team: 'acme',
      token: 'mock-token',
    })
    mock = new MockAdapter(api.client)
  })

  describe('integration testing', () => {
    const { ESA_TEAM: team, ESA_TOKEN: token } = process.env as any
    if (typeof team !== 'string' || typeof token !== 'string') {
      console.warn(
        'skipped integration testing since `ESA_TEAM` and `ESA_TOKEN` was not provided',
      )
      return
    }
    test('get one post', async () => {
      api = new EsaApi({ team, token })
      const { posts } = await api.getPosts({ per_page: 1 })
      expect(posts.length).toBe(1)
    })
  })

  describe('enhead authorization', () => {
    test('token', async () => {
      mock.onGet('/teams/acme/posts').replyOnce(({ headers }) => {
        expect(headers).toMatchObject({ Authorization: 'Bearer mock-token' })
        return [200, {}, {}]
      })
      await api.getPosts()
    })
  })

  describe('posts', () => {
    test('request parameters', async () => {
      mock.onGet('/teams/acme/posts').replyOnce(({ params }) => {
        expect(params).toEqual({
          q: 'text',
          include: 'comments,stargazers',
          sort: 'stars',
          order: 'desc',
          page: 2,
          per_page: 100,
        })
        return [200, {}, {}]
      })
      await api.getPosts({
        q: 'text',
        include: ['comments', 'stargazers'],
        sort: 'stars',
        order: 'desc',
        page: 2,
        per_page: 100,
      })
    })

    test('get 2 posts', async () => {
      mock.onGet('/teams/acme/posts').replyOnce<Partial<PostsPayload>>(
        200,
        {
          posts: [{}, {}] as Post[],
          next_page: 2,
        },
        {},
      )
      const data = await api.getPosts({ per_page: 2 })
      expect(data.posts.length).toBe(2)
    })

    test('pagination', async () => {
      const post1 = { number: 1 } as Post
      mock.onGet('/teams/acme/posts').replyOnce<Partial<PostsPayload>>(
        200,
        {
          posts: [post1] as Post[],
          next_page: 2,
        },
        {},
      )

      const data1 = await api.getPosts({ per_page: 1 })
      expect(data1.posts[0]).toEqual(post1)

      const post2 = { number: 2 } as Post
      mock.onGet('/teams/acme/posts').replyOnce<Partial<PostsPayload>>(
        200,
        {
          posts: [post2] as Post[],
          next_page: 3,
        },
        {},
      )

      const data2 = await api.getPosts({ per_page: 1, page: data1.next_page! })
      expect(data2.posts[0]).toEqual(post2)
    })

    test('embody ratelimit', async () => {
      mock.onGet('/teams/acme/posts').replyOnce<Partial<PostsPayload>>(
        200,
        {
          posts: [],
        },
        {
          'x-ratelimit-limit': '75',
          'x-ratelimit-remaining': '73',
          'x-ratelimit-reset': '1589974200',
        },
      )
      const { ratelimit } = await api.getPosts()
      expect(ratelimit).toEqual({
        limit: 75,
        remaining: 73,
        reset: new Date(1589974200 * 1000),
      })
    })
  })

  test('embody team name', async () => {
    mock.onGet('/teams/acme/posts').replyOnce<Partial<PostsPayload>>(
      200,
      {
        posts: [],
      },
      {},
    )
    const { team } = await api.getPosts()
    expect(team).toBe('acme')
  })
})

import { Actions, NodePluginArgs } from 'gatsby'
import { Post } from './esaApi'

type NewEsaNodeCreator = (params: {
  readonly team: string
  readonly createNode: Actions['createNode']
  readonly createNodeId: NodePluginArgs['createNodeId']
  readonly createContentDigest: NodePluginArgs['createContentDigest']
  readonly getNode: NodePluginArgs['getNode']
  readonly createParentChildLink: Actions['createParentChildLink']
}) => EsaNodeCreator

export interface EsaNodeCreator {
  createPostNodes(posts: ReadonlyArray<Readonly<Post>>): Promise<void>

  createPostNode(post: Pick<Readonly<Post>, 'url'>): Promise<string>

  createPostBodyMarkdownNode(
    post: Pick<Readonly<Post>, 'body_md' | 'url'>,
  ): Promise<string>

  createPostBodyHtmlNode(
    post: Pick<Readonly<Post>, 'body_html' | 'url'>,
  ): Promise<string>
}

export const newEsaNodeCreator: NewEsaNodeCreator = ({
  team,
  createNode,
  createNodeId,
  createContentDigest,
  getNode,
  createParentChildLink,
}) => {
  const createPostNode: EsaNodeCreator['createPostNode'] = async (
    post,
    children = [],
  ) => {
    const id = createNodeId(post.url)
    await createNode({
      ...post,
      team,
      id,
      internal: {
        type: 'EsaPost',
        contentDigest: createContentDigest(post),
        description: post.url,
      },
      children,
    })
    return id
  }

  const createPostBodyMarkdownNode: EsaNodeCreator['createPostBodyMarkdownNode'] = async ({
    url,
    body_md,
  }) => {
    const id = createNodeId(`${url}.md`)
    await createNode({
      id,
      team: team,
      content: body_md,
      internal: {
        type: 'EsaPostBodyMarkdown',
        contentDigest: createContentDigest(body_md),
        description: `${url}.md`,
        content: body_md,
        mediaType: 'text/markdown',
      },
    })
    return id
  }

  const createPostBodyHtmlNode: EsaNodeCreator['createPostBodyHtmlNode'] = async ({
    body_html,
    url,
  }) => {
    const id = createNodeId(`${url}.html`)
    await createNode({
      id,
      team: team,
      content: body_html,
      internal: {
        type: 'EsaPostBodyHtml',
        contentDigest: createContentDigest(body_html),
        description: `${url}`,
        content: body_html,
        mediaType: 'text/html',
      },
    })
    return id
  }

  const linkPostChildren = (
    postId: string,
    {
      htmlId,
      markdownId,
    }: {
      readonly htmlId: string
      readonly markdownId: string
    },
  ): void => {
    const markdownNode = getNode(markdownId)
    const htmlNode = getNode(htmlId)
    const postNode = getNode(postId)
    createParentChildLink({ parent: postNode, child: markdownNode })
    createParentChildLink({ parent: postNode, child: htmlNode })
  }

  const createPostNodes: EsaNodeCreator['createPostNodes'] = async posts => {
    for (const post of posts) {
      const markdownId = await createPostBodyMarkdownNode(post)
      const htmlId = await createPostBodyHtmlNode(post)
      const postId = await createPostNode(post)
      linkPostChildren(postId, { htmlId, markdownId })
    }
  }

  return {
    createPostNodes,
    createPostNode,
    createPostBodyHtmlNode,
    createPostBodyMarkdownNode,
  }
}

import { SourceNodesArgs } from 'gatsby'
import { Errors } from './lib/errors'
import { EsaApi, PostsPayload } from './lib/esaApi'
import { newEsaNodeCreator } from './lib/esaNodeCreator'
import { isValidPluginOptions, PluginOptions } from './lib/pluginOptions'
import { createSchemaCustomization } from './lib/createSchemaCustomization'

// noinspection JSUnusedGlobalSymbols
export const sourceNodes = async (
  {
    createNodeId,
    createContentDigest,
    actions: { createNode, createParentChildLink },
    getNode,
    reporter,
  }: Pick<
    SourceNodesArgs,
    'createNodeId' | 'createContentDigest' | 'actions' | 'reporter' | 'getNode'
  >,
  options?: PluginOptions,
): Promise<void> => {
  const errors = new Errors()
  if (!isValidPluginOptions(options, errors)) {
    reporter.error(
      `[gatsby-source-esa]\nPlease check your plugin options:\n${errors}`,
    )
    return
  }
  const { team, posts: postsParams = {} } = options
  const esa = new EsaApi({ team, token: options.token })
  const nodeCreator = newEsaNodeCreator({
    team,
    createNode,
    createNodeId,
    createContentDigest,
    getNode,
    createParentChildLink,
  })
  let page: null | number = 1
  while (page) {
    const { posts, next_page }: PostsPayload = await esa.getPosts({
      page,
      ...postsParams,
      per_page: EsaApi.postsPerPageMax,
    })
    await nodeCreator.createPostNodes(posts)
    page = next_page
  }
}

export { createSchemaCustomization }

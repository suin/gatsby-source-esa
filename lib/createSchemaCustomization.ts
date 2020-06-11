import { CreateSchemaCustomizationArgs, GatsbyNode } from 'gatsby'

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = async ({
  actions,
}: CreateSchemaCustomizationArgs): Promise<any> => {
  const { createTypes } = actions
  // language=GraphQL
  const typeDefs = `
    type EsaPost implements Node {
      team: String!
      number: Int!
      name: String!
      full_name: String!
      wip: Boolean!
      body_md: String!
      body_html: String!
      created_at: Date! @dateformat
      message: String!
      kind: String!
      comments_count: Int!
      tasks_count: Int!
      done_tasks_count: Int!
      url: String!
      updated_at: Date! @dateformat
      tags: [String!]!
      category: String!
      revision_number: Int!
      created_by: EsaPostUser!
      updated_by: EsaPostUser!
      stargazers_count: Int!
      watchers_count: Int!
      star: Boolean!
      watch: Boolean!
    }
    
    type EsaPostBodyHtml implements Node {
      team: String!
      html: String!
      content: String!
    }
    
    type EsaPostBodyMarkdown implements Node {
      team: String!
      content: String!
    }
    
    type EsaPostUser {
      name: String!
      screen_name: String!
      icon: String!
    }
  `
  createTypes(typeDefs)
}

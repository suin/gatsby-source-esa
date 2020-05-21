import { ActionPlugin, ActionOptions } from 'gatsby'

declare module 'gatsby' {
  export interface Actions {
    /** @see https://www.gatsbyjs.org/docs/actions/#createNode */
    createNode(
      node: NodeInput,
      plugin?: ActionPlugin,
      options?: ActionOptions,
    ): Promise<void>
  }
}

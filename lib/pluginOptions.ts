import { isObject } from '@suin/is-object'
import { Errors } from './errors'
import { GetPostsParameters } from './esaApi'

export type PluginOptions = {
  /**
   * チーム名
   */
  readonly team: string

  /**
   * esa APIアクセストークン
   */
  readonly token: string

  /**
   * 投稿一覧取得APIのクエリ文字列にセットする情報
   */
  readonly posts?: GetPostsParameters
}

/**
 * @internal
 */
const isPluginOptions = (value: unknown): value is PluginOptions =>
  isObject<PluginOptions>(value) &&
  typeof value.team === 'string' &&
  typeof value.token === 'string'

/**
 * @internal
 */
export const isValidPluginOptions = (
  options: unknown,
  errors: Errors,
): options is PluginOptions => {
  if (!isPluginOptions(options)) {
    errors.add('`team` and `token` property must be specified.')
    return false
  }
  const { team, token } = options
  if (team.length === 0) errors.add('`team` property must be specified.')
  if (token.length === 0) errors.add('`token` property must be specified.')
  return errors.noErrors()
}

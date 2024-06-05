import type { IBuilderConfig } from './types'

export * from './build'
export * from './shared'
export * from './types'

export function defineConfig(config: IBuilderConfig) {
  return config
}

import fs from 'fs-extra'
import path from 'path'
import type { IBuilderConfig } from '../types'
import { cwd } from './utils'

export const entry = path.resolve(cwd, 'src/index.ts')

type IBuilderRequiredConfig = Required<Pick<IBuilderConfig, 'targetLibCjsDir' | 'targetLibEsDir' | 'buildCli'>>

const configs: IBuilderConfig = {}

export const setConfig = async (config: IBuilderConfig) => {
  Object.assign(configs, config)
  return configs
}

export const getBuilderConfig = async () => {
  const builderConfigs: IBuilderConfig & IBuilderRequiredConfig = {
    targetLibCjsDir: 'lib',
    targetLibEsDir: 'esm',
    buildCli: 'babel',
    ...configs,
  }
  return builderConfigs
}

let pkg: any = {}

try {
  pkg = fs.readJSONSync(path.resolve(cwd, 'package.json'))
} catch {
  pkg = {}
}

export { pkg }

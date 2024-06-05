import fs from 'fs-extra'
import { glob } from 'glob'
import path from 'path'
import { getBuilderConfig } from '../shared'
import { cwd } from '../shared/utils'
import type { IBuilderConfig } from '../types'

const cjsToEs = (contents: string, builderConfigs: IBuilderConfig) => {
  return contents.replace(
    new RegExp(`${builderConfigs.targetLibName}\\/${builderConfigs.targetLibCjsDir}\\/`, 'g'),
    `${builderConfigs.targetLibName}/${builderConfigs.targetLibEsDir}/`
  )
}

const esToCjs = (contents: string, builderConfigs: IBuilderConfig) => {
  return contents.replace(
    new RegExp(`${builderConfigs.targetLibName}\\/${builderConfigs.targetLibEsDir}\\/`, 'g'),
    `${builderConfigs.targetLibName}/${builderConfigs.targetLibCjsDir}/`
  )
}

export const fixDepsPaths = async () => {
  const builderConfigs = await getBuilderConfig()
  if (!builderConfigs.targetLibName || !builderConfigs.targetLibCjsDir || !builderConfigs.targetLibEsDir) return
  const files = await glob('{esm,lib}/**/*.{js,ts,less,scss}', { cwd })
  files.forEach(filename => {
    const isCjsPath = filename.includes(`lib/`)
    const isEsPath = filename.includes(`esm/`)
    const filepath = path.resolve(cwd, filename)
    const contents = fs.readFileSync(filepath, 'utf-8')
    const replaced = isCjsPath
      ? esToCjs(contents, builderConfigs)
      : isEsPath
        ? cjsToEs(contents, builderConfigs)
        : contents
    fs.writeFileSync(filepath, replaced, 'utf-8')
  })
}

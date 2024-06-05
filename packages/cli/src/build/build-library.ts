import { execa } from 'execa'
import fs from 'fs-extra'
import path from 'path'
import { cwd, exitChild, getBuilderConfig, success } from '../shared'

const hasBuildConfig = async () => {
  try {
    await fs.access(path.resolve(cwd, 'tsconfig.build.json'))
    return true
  } catch {
    return false
  }
}

/**
 * ts file type check
 * https://www.typescriptlang.org/docs/handbook/babel-with-typescript.html
 */
const buildType = async (params: string[] = []) => {
  const hasProjects = await hasBuildConfig()
  if (hasProjects) {
    params.unshift('--project', 'tsconfig.build.json')
  }

  const child = execa('tsc', params)
  await exitChild(child)
  success(`build type`)
}

interface BuildDefaultOpts {
  outDir: string
  env: 'es' | 'cjs'
}

const runBabel = async (options: BuildDefaultOpts) => {
  const { outDir, env } = options
  const child = execa('babel', [
    'src',
    '--out-dir',
    outDir,
    '--env-name',
    env,
    '--extensions',
    '.ts,.tsx',
    '--copy-files',
  ])

  await exitChild(child)
  success(`build babel ${env} in ${outDir}`)
}

const runTsc = async (options: BuildDefaultOpts) => {
  const { outDir, env } = options
  const params: string[] = []

  const hasProjects = await hasBuildConfig()
  if (hasProjects) {
    params.unshift('--project', 'tsconfig.build.json')
  }

  params.push('--module', env === 'es' ? 'ESNext' : 'CommonJS')
  params.push('--outDir', outDir)

  const child = execa('tsc', params)
  await exitChild(child)
  success(`build tsc ${env} in ${outDir}`)
}

const buildDefault = async (options: BuildDefaultOpts) => {
  const { outDir } = options
  const builderConfigs = await getBuilderConfig()
  const { buildCli } = builderConfigs

  if (buildCli === 'tsc') {
    await runTsc(options)
  } else {
    await buildType([
      '--outDir',
      outDir,
      '--sourceRoot',
      outDir,
      // Only output d.ts files and not JavaScript files.
      '--emitDeclarationOnly',
      // Ensure that Babel can safely transpile files in the TypeScript project
      '--isolatedModules',
    ])
    await runBabel(options)
  }
}

const buildEsm = async () => {
  const builderConfigs = await getBuilderConfig()
  const { targetLibEsDir } = builderConfigs
  await buildDefault({ outDir: targetLibEsDir, env: 'es' })
}

const buildCjs = async () => {
  const builderConfigs = await getBuilderConfig()
  const { targetLibCjsDir } = builderConfigs
  await buildDefault({ outDir: targetLibCjsDir, env: 'cjs' })
}

export const buildLibrary = async () => {
  const builderConfigs = await getBuilderConfig()
  await buildEsm()
  if (builderConfigs.buildCjs) {
    await buildCjs()
  }
}

import { execa } from 'execa'
import fs from 'fs-extra'
import { glob } from 'glob'
import path from 'path'
import { rimraf } from 'rimraf'
import { getBuilderConfig, pkg, setConfig, success } from '../shared'
import { cwd } from '../shared/utils'
import { buildLibrary } from './build-library'
import { buildRootStyle } from './build-root-style'
import { buildUmd } from './build-umd'
import { copyStyleFiles } from './copy-style-files'
import { fixDepsPaths } from './fix-deps-paths'

const getRootPackage = async () => {
  try {
    return await fs.readJSON(path.resolve(cwd, 'package.json'))
  } catch {
    return {}
  }
}

const isMonorepoRoot = async () => {
  try {
    const lerna = await fs.readJSON(path.resolve(cwd, 'lerna.json'))
    return !!lerna
  } catch {
    return false
  }
}

const searchPackages = async () => {
  const root = await getRootPackage()
  const workspaces: any[] = root.workspaces || []
  const packages: string[] = []
  workspaces.forEach((pattern: string) => {
    const results = glob.sync(pattern, { cwd })
    results.forEach(filename => {
      try {
        const package_path = path.resolve(cwd, filename)
        const stat = fs.statSync(package_path)
        if (stat.isDirectory()) {
          packages.push(package_path)
        }
      } catch {}
    })
  })
  return packages
}

const cleanupPackage = async (pattern: string) => {
  const { targetLibCjsDir, targetLibEsDir } = await getBuilderConfig()
  await rimraf(path.resolve(`${pattern}/{${targetLibCjsDir},${targetLibEsDir},dist}`))
  success(`cleanup package ${pattern}`)
}

const cleanupPackages = async () => {
  const isMonorepo = await isMonorepoRoot()
  if (isMonorepo) {
    const packages = await searchPackages()
    for (const pattern of packages) {
      await cleanupPackage(pattern)
    }
  }
}

const buildPackage = async () => {
  const builderConfigs = await getBuilderConfig()
  await copyStyleFiles()
  await buildLibrary()
  if (builderConfigs.buildUmd) {
    await buildRootStyle()
    await buildUmd()
  }
  await fixDepsPaths()
}

export interface BuildOptions {
  umd?: boolean
  cjs?: boolean
  cli?: 'babel' | 'tsc'
}

const buildPackages = async () => {
  const isMonorepo = await isMonorepoRoot()
  const now = Date.now()
  if (isMonorepo) {
    const child = execa('lerna', ['run', 'build'])
    child.stdout?.pipe(process.stdout)
    await child
    success(`build packages in ${Date.now() - now}ms`)
  } else {
    await buildPackage()
    success(`build package ${pkg.name} in ${Date.now() - now}ms`)
  }
}

export const build = async (options: BuildOptions) => {
  setConfig({
    buildUmd: options.umd,
    buildCjs: options.cjs,
    buildCli: options.cli,
  })
  await cleanupPackages()
  await buildPackages()
}

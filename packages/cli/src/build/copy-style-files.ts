import fs from 'fs-extra'
import { glob } from 'glob'
import path from 'path'
import { cwd, getBuilderConfig, success } from '../shared'

export const copyStyleFiles = async () => {
  const files = await glob('src/**/*.{less,scss,sass,css}', { cwd })
  const { targetLibCjsDir, targetLibEsDir, buildCjs } = await getBuilderConfig()

  files.forEach(filename => {
    const filepath = path.resolve(cwd, filename)

    const distPathEs = filepath.replace(/src\//, `${targetLibEsDir}/`).replace(/src\\/, `${targetLibEsDir}\\`)
    fs.copySync(filepath, distPathEs)
    success(`copy style files to ${distPathEs}`)

    if (buildCjs) {
      const distPathLib = filepath.replace(/src\//, `${targetLibCjsDir}/`).replace(/src\\/, `${targetLibCjsDir}\\`)
      fs.copySync(filepath, distPathLib)
      success(`copy style files to ${distPathLib}`)
    }
  })
}

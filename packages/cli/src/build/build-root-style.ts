import fs from 'fs-extra'
import { glob } from 'glob'
import path from 'path'
import { cwd } from '../shared'

const createStyleFile = (files: string[]) => {
  return `// auto generated code
${files
  .map(path => {
    return `import '${path}'\n`
  })
  .join('')}`
}

export const buildRootStyle = async () => {
  const files = await glob('./**/*/style.{less,scss,sass}', { cwd: path.resolve(cwd, './src') })
  if (files.length === 0) return
  await fs.writeFile(path.resolve(cwd, './src/style.ts'), createStyleFile(files), 'utf8')
}

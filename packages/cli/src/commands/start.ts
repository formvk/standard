import chalk from 'chalk'
import { program } from 'commander'
import fs from 'fs'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import { build } from '../build'
import { error } from '../shared/logger'

export interface ICommand {
  command: string
  description: string
  action: (...args: any[]) => void | Promise<void>
  options?: [string, string, string?][]
}

function getCommands() {
  const list: ICommand[] = [
    {
      command: 'build',
      description: 'Build a package',
      action: build,
      options: [
        ['--umd', '是否打包umd格式'],
        ['--cjs', '是否打包cjs格式'],
        ['--cli <cli>', '使用tsc 或 babel 进行打包'],
      ],
    },
  ]
  return list
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 获取当前包的信息
const getPkgInfo = () => {
  const jsonPath = path.join(__dirname, '../package.json')
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8')
  const jsonResult = JSON.parse(jsonContent)
  return jsonResult
}

export function start() {
  const commands = getCommands()
  commands.forEach(({ command, description, action, options }) => {
    const prog = program.command(command).description(description).action(action)
    if (options) {
      options.forEach(option => {
        prog.option(...option)
      })
    }
  })
  const { version } = getPkgInfo()
  program.version(version)
  program.on('command:*', async ([cmd]) => {
    program.outputHelp()
    error(`未知命令 command ${chalk.yellow(cmd)}.`)
    process.exitCode = 1
  })
  program.parseAsync(process.argv)
}

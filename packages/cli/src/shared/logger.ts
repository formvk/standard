/* eslint-disable no-console */
import chalk from 'chalk'

export const warn = (text: string) => {
  console.log(chalk.yellow(`\n${text}\n`))
}

export const info = (text: string) => {
  console.log(chalk.cyan(`\n${text}\n`))
}

export const error = (text: string) => {
  console.log(chalk.bgRed(`\n${text}\n`))
}

export const success = (text: string) => {
  console.log(chalk.green(`\n${text}\n`))
}

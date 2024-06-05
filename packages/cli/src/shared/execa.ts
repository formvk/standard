import type { ExecaChildProcess } from 'execa'

export const exitChild = async (child: ExecaChildProcess<string>) => {
  child.stdout?.pipe(process.stdout)
  const res = await child
  if (res.exitCode !== 0) {
    process.exit(res.exitCode)
  }
  return res
}

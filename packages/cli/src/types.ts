export interface IBuilderConfig {
  /**
   * externals 配置，用于rollup 打包时的 externals 配置
   */
  externals?: Record<string, string>
  /**
   * 当前仓库核心依赖的三方组件库名称
   */
  targetLibName?: string
  /**
   * 构建工具
   * @default 'babel'
   */
  buildCli?: 'babel' | 'tsc'
  /**
   * 是否打包cjs格式文件
   * @default false
   */
  buildCjs?: boolean
  /**
   * 核心三方库cjs目录名
   * @default 'lib'
   */
  targetLibCjsDir?: string
  /**
   * 核心三方库es目录名
   * @default 'esm'
   */
  targetLibEsDir?: string
  /**
   * 是否打包 umd 格式
   * @default false
   */
  buildUmd?: boolean
  /**
   * 是否打包全量类型文件
   * 仅 buildUmd 为true时生效
   * @default false
   */
  bundleDts?: boolean
}

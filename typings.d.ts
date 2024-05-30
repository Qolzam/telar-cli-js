declare module 'hybrid-crypto-js'

declare module 'port-used' {
  function check(port: number, host: string): Promise<boolean>

  export {check}
}

declare module 'tiged' {
  function degit(
    src: string,
    opts: {
      disableCache?: boolean
      force?: boolean
      verbose?: boolean
    },
  ): () => unknown
  export default degit
}

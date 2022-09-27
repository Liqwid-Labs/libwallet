// import type { WalletApi } from '@cardano-sdk/cip30'

export type WalletImplType = {
  /** Name of the target, e.g: Example */
  name: string
  /** Icon URL of the target, e.g: https://example.com/favicon.svg, can also a base64 source */
  icon?: string
  /** Origin URL, e.g: https://example.com/ */
  origin: string
  /** Preferably short, unique id used to identify wallets, e.g: exmpl */
  id: string
  /** Boolean enabling or disabling wallets depending on the CTL supported wallets */
  supported: boolean
}

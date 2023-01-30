import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

export const name = 'Eternl'
export const origin = 'https://eternl.io/'
export const id = 'eternl'
export const icon = 'https://eternl.io/icons/favicon-128x128.png'
export const supported = true as const

export const init = (_: { wallet: Wallet, api: WalletApi }) => {

}

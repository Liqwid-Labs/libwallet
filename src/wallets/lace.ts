import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

export const name = 'Lace'
export const origin = 'https://www.lace.io/'
export const id = 'lace'
export const icon = 'https://www.lace.io/favicon.ico'
export const supported = true as const

export const init = (_: { wallet: Wallet, api: WalletApi }) => {

}

import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

import laceLogo from './assets/lace.svg'

export const name = 'Lace'
export const origin = 'https://www.lace.io/'
export const id = 'lace'
export const icon = laceLogo
export const supported = true as const

export const init = (_: { wallet: Wallet, api: WalletApi }) => {
}

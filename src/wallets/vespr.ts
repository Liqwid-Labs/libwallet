import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

import nufiLogo from './assets/vespr.svg'

export const name = 'Vespr'
export const origin = 'https://www.vespr.xyz/'
export const id = 'vespr'
export const icon = nufiLogo
export const supported = true as const

export const init = (_: { wallet: Wallet, api: WalletApi }) => {
}

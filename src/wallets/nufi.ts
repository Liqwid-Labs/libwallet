import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

import nufiLogo from './assets/nufi.svg'

export const name = 'NuFi'
export const origin = 'https://nu.fi/'
export const id = 'nufi'
export const icon = nufiLogo
export const supported = true as const

export const init = (_: { wallet: Wallet, api: WalletApi }) => {

}

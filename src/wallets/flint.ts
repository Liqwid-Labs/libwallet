// IMPL IS CLOSED SOURCE

import type { WalletApi } from '@cardano-sdk/cip30'
import type { Wallet } from '..'

export const name = 'Flint'
export const origin = 'https://flint-wallet.com/'
export const id = 'flint'
export const icon = 'https://flint-wallet.com/favicon.png'
export const supported = true

export const events = []

export type FlintInternalState = {

}

// @ts-ignore
export const init = ({ wallet, api, state }: { wallet: Wallet, api: WalletApi, state: FlintInternalState }) => {

}

// @ts-ignore
export const terminate = ({ wallet, api, state }: { wallet: Wallet, api: WalletApi, state: FlintInternalState }) => {
  // remove accountChange listener?
}


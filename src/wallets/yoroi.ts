// YOROI INJECT IMPL: https://github.com/Emurgo/yoroi-frontend/blob/3c89d6b7eb19b5d0936d8124476dbd9651f79a02/packages/yoroi-ergo-connector/src/inject.js
import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

export const name = 'Yoroi'
export const origin = 'https://yoroi-wallet.com/'
export const id = 'yoroi'
export const icon = 'https://yoroi-wallet.com/assets/favicon.png'
export const supported = true as const

export const init = (_: { wallet: Wallet, api: WalletApi }) => {

}

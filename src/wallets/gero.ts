import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-browser'

// IMPL IS CLOSED SOURCE

export const name = 'Gero'
export const origin = 'https://gerowallet.io/'
export const id = 'gerowallet'
export const icon = 'https://gerowallet.io/assets/img/logo2.ico'
export const supported = true as const

/**
 * chrome-extension://hlhgkklljaiclhhfolbodaifkgclgflo/inject.js:formatted:339:1
 */
export const events = ['accountChange']

export const init = ({ wallet, api }: { wallet: Wallet, api: WalletApi }) => {
  ;(api as any).onAccountChange((addresses: [string]) => {
    wallet.emit(
      'accountChange',
      {
        addresses:
          addresses
            .flat(Infinity)
            .map(hexAddress => {
              const address = BaseAddress.from_address(Address.from_hex(hexAddress))
              if (!address) throw new Error('Nami accountChange did not return valid hex address')
              return address
            }) as [BaseAddress]
      }
    )
  })
}

// @ts-ignore
export const terminate = ({ wallet, api }: { wallet: Wallet, api: WalletApi }) => {
  // remove accountChange listener?
}

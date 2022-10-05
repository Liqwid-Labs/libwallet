import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

import { isWalletEnabled } from '..'

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
  const onAccountChange = (addresses: [string]) => {
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
  }
  ;(api as any).onAccountChange(onAccountChange)

  const interval = window.setInterval(async () => {
    if (await isWalletEnabled(wallet.id)) return
    wallet.emit('disconnect', {})
    ;(api as any).experimental.off('accountChange', onAccountChange)
    clearInterval(interval)
  }, 100)
}

// @ts-ignore
export const terminate = ({ wallet, api, state }: { wallet: Wallet, api: WalletApi, state: GeroInternalState }) => {
  // remove accountChange listener?
}

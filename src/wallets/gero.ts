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

export type GeroInternalState = {
  registeredEvents: boolean
  enabledInterval: number
  isEnabled: boolean
}

export const init = ({ wallet, api, state }: { wallet: Wallet, api: WalletApi, state: GeroInternalState }) => {
  if (!state.registeredEvents) {
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
    state.registeredEvents = true
  }

  state.isEnabled = true
  state.enabledInterval = window.setInterval(async () => {
    if (state.isEnabled && !(await wallet.isEnabled())) {
      wallet.emit('disconnect', {})
      state.isEnabled = false
    }
  }, 500)
}

// @ts-ignore
export const terminate = ({ wallet, api, state }: { wallet: Wallet, api: WalletApi, state: GeroInternalState }) => {
  // remove accountChange listener?
}

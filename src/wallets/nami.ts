import type { WalletApi } from '@cardano-sdk/cip30'

import type { Wallet } from '..'

import { isWalletEnabled } from '..'

import { Address, BaseAddress } from '@emurgo/cardano-serialization-lib-browser'


// YOROI INJECT IMPL: https://github.com/Berry-Pool/nami-wallet/blob/259cecff6ebb1c7f8960b740adcca04b14fb840a/src/pages/Content/injected.js


export const name = 'Nami'
export const origin = 'https://namiwallet.io/'
export const id = 'nami'
export const icon = 'https://namiwallet.io/favicon.svg?v=211b0d7bf3f14a0a7b86ec579c75946b'
export const supported = true as const


/**
 * https://github.com/berry-pool/nami/blob/main/src/config/config.js#L113-L120
 */
export const events = ['accountChange', 'networkChange']

export const init = ({ wallet, api }: { wallet: Wallet, api: WalletApi }) => {
  const onAccountChange = (addresses: [string]) => {
    wallet.emit(
      'accountChange',
      {
        addresses:
          addresses
            .map(hexAddress => {
              const address = BaseAddress.from_address(Address.from_hex(hexAddress))
              if (!address) throw new Error('Nami accountChange did not return valid hex address')
              return address
            }) as [BaseAddress]
      }
    )
  }

  const onNetworkChange = (networkId: number) =>
    wallet.emit('networkChange', {networkId })

  ;(api as any).experimental.on('accountChange', onAccountChange)
  ;(api as any).experimental.on('networkChange', onNetworkChange)

  const interval = window.setInterval(async () => {
    if (await isWalletEnabled(wallet.id)) return
    wallet.emit('disconnect', {})
    ;(api as any).experimental.off('accountChange', onAccountChange)
    ;(api as any).experimental.off('networkChange', onNetworkChange)
    clearInterval(interval)
  }, 100)
}

import type { BaseAddress } from '@emurgo/cardano-serialization-lib-browser'

import { makeEventEmitter } from './utils/events'
import { getWalletImpl, SupportedWalletId } from './wallets'

export * from './wallets'

export type Wallet = Awaited<ReturnType<typeof makeWallet>>

type WalletEvents = {
  accountChange: {
    addresses: [BaseAddress]
  }
  networkChange: {

  }
  disconnect: {}
}

export const makeWallet = async <T extends SupportedWalletId>({ id }: { id: T }) => {
  const walletImpl = getWalletImpl(id)
  const api = await walletImpl.cip30Wallet.enable()
  const eventEmitter = makeEventEmitter<WalletEvents>({ events: ['accountChange', 'networkChange', 'disconnect'] })
  const wallet = {
    id,
    api,
    walletImpl,
    ...eventEmitter
  } as const

  walletImpl.wallet.init({ wallet, api })
  return wallet
}

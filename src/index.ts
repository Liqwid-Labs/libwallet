import type { WalletApi } from '@cardano-sdk/cip30'
import type { BaseAddress } from '@emurgo/cardano-serialization-lib-browser'

import PQueue from 'p-queue'
import { WalletError } from './utils/errors'
import { makeEventEmitter } from './utils/events'
import { getWalletImpl, SupportedWalletIds } from './wallets'

export * from './wallets'

export type Wallet = Awaited<ReturnType<typeof makeWallet>>

type WalletEvents = {
  accountChange: {
    addresses: [BaseAddress]
  }
  networkChange: {

  }
}

export const makeWallet = <T extends SupportedWalletIds>({ id }: { id: T }) => {
  const walletImpl = getWalletImpl(id)
  const eventEmitter = makeEventEmitter<WalletEvents>({ events: ['accountChange', 'networkChange'] })
  
  let _api: WalletApi | undefined
  let inited = false

  const init = ({ wallet, api }: { wallet: Wallet, api: WalletApi }) => {
    if (inited) return
    if ('init' in walletImpl.wallet) {
      walletImpl.wallet.init({ wallet, api })
    }
    inited = true
  }
 
  const enable = async () => {
    if (_api) return _api
    const api = await walletImpl.cip30Wallet.enable()
    _api = api
    if (!inited) init({ wallet, api })
    return api
  }
  const isEnabled = () => walletImpl.cip30Wallet.isEnabled()

  const getApi = async () => {
    if (_api) return _api
    if (!await walletImpl.cip30Wallet.isEnabled()) throw new WalletError(`Wallet "${id}" not enabled`)
    const api = await walletImpl.getApi()
    _api = api
    if (!inited) init({ wallet, api })
    return api
  }

  const wallet = {
    id,
    enable,
    isEnabled,
    getApi,
    walletImpl,
    terminate: () => {
      if (!_api) return
      if ('terminate' in walletImpl.wallet) {
        walletImpl.wallet.terminate({ wallet, api: _api })
      }
    },
    ...eventEmitter
  } as const

  return wallet
}

export interface WrapOffchainContextOptions<T> {
  init: ({ wallet }: { wallet?: Wallet }) => Promise<T>
  terminate: (context: Awaited<ReturnType<WrapOffchainContextOptions<T>['init']>>) => Promise<void>
}

type WrapOffchainOptions<T> =
  WrapOffchainContextOptions<T>
  & {
    queue?: boolean
    wallet?: Wallet
  }

type WrapFunctionOptions = {
  queue?: boolean
}


export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;

export const wrapOffchain = <T>(options: WrapOffchainOptions<T>) => {
  const queue = new PQueue({ concurrency: options.queue ? 1 : Infinity })
  let wallet: Wallet | undefined = options.wallet
  let context: T | undefined

  const getContext = async (): Promise<T> => {
    if (!context) context = await (options as WrapOffchainContextOptions<T>).init({ wallet })
    return context
  }

  const wrapFunction =
    <T2 extends (context: T, ...args: any[]) => any>(func: T2, options?: WrapFunctionOptions) => {
      if (options && !options.queue) {
        return (
          (...args: Parameters<OmitFirstArg<T2>>) =>
            getContext()
              .then(context => func(context, ...args))
        )
      }
      return (
        (...args: Parameters<OmitFirstArg<T2>>) =>
          queue
            .add(() =>
              getContext()
                .then(context => func(context, ...args))
            ) as ReturnType<Awaited<Promise<OmitFirstArg<T2>>>>
      )
    }

  return {
    wrapFunction,
    setWallet: (_wallet: Wallet | undefined) => {
      wallet = _wallet
    },
    getWallet: () => wallet
  }
}

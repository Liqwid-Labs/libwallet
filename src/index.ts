import type { BaseAddress } from '@emurgo/cardano-serialization-lib-browser'

import PQueue from 'p-queue'
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

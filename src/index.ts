import PQueue from 'p-queue'
import { WalletError } from './utils/errors'
import { getWalletImpl, SupportedWalletIds } from './wallets'

export * from './wallets'

export type Wallet = Awaited<ReturnType<typeof makeWallet>>

export const makeWallet = <T extends SupportedWalletIds>({ id }: { id: T }) => {
  const walletImpl = getWalletImpl(id)

  const enable = () => walletImpl.cip30Wallet.enable()
  const isEnabled = () => walletImpl.cip30Wallet.isEnabled()

  const getApi = async () => {
    if (!await walletImpl.cip30Wallet.isEnabled()) throw new WalletError(`Wallet "${id}" not enabled`)
    return walletImpl.getApi()
  }

  return {
    id,
    enable,
    isEnabled,
    getApi,
    walletImpl
  } as const
}

// type Api = {
//   [key: string]: (...args: any[]) => any
// }

// export interface WrapOffchainEnvOptions<T, T2 extends Api> {
//   init: (walletName: SupportedWalletIds) => Promise<T>
//   terminate: ({ context }: { context: Awaited<ReturnType<WrapOffchainEnvOptions<T, T2>['init']>> }) => Promise<void>
//   api: (apiOptions: { context: T }) => T2
// }

// export type WrapOffchainOptions<T, T2 extends Api> =
//   WrapOffchainEnvOptions<T, T2>
//   & {
//     queue?: boolean
//     wallet?: Wallet
//   }

// export type Offchain = typeof wrapOffchain

// export type OffchainClient<T, T2 extends Api> = {
//   setContext: (context: T) => void
//   getContext: () => T | undefined
//   setWallet: (wallet: Wallet | undefined) => void
//   getWallet: () => Wallet | undefined
//   api: T2
// }

// export const wrapOffchain = <T, T2 extends Api>(options: WrapOffchainOptions<T, T2>): Promise<OffchainClient<T, T2>> => {
//   const queue = new PQueue({ concurrency: options.queue ? 1 : Infinity })

//   let wallet: Wallet | undefined = options.wallet
//   let context: T | undefined

//   const getContext = async (): Promise<T> => {
//     if (!context) context = await (options as WrapOffchainEnvOptions<T, T2>).init(wallet.id)
//     return context
//   }

//   const _api = options.api({ context: await getContext() })


//   const api = Object.fromEntries(
//     Object
//       .entries(_api)
//       // Wrap each API functions around a queueing system
//       .map(([key, func]) => [
//         key,
//         (...args: Parameters<T2[number]>) => queue.add(() => func(...args))
//       ] as const)
//       // Wrap each functions around a wallet check
//       .map(([key, func]) => [
//         key,
//         async (...args: Parameters<T2[number]>) => {
//           // if (!wallet) throw new MissingWalletError('Tried calling an api function without a wallet')
//           // if (!await wallet.isEnabled()) throw new MissingWalletError('Tried calling an api function without a wallet enabled')
//           return func(...args)
//         }
//       ] as const)
//   ) as T2

//   return api
// }

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

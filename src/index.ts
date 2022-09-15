import PQueue from 'p-queue'
import { ImportError, MissingWalletError } from './utils/errors'
import { getWalletImpl, SupportedWalletIds } from './wallets'

import makeLiqwid from './liqwid'

export type Wallet = Awaited<ReturnType<typeof makeWallet>>

export const makeWallet = async ({ id }: { id: SupportedWalletIds }) => {
  const walletImpl = await getWalletImpl(id)

  return {
    id: id
  } as const
}

type Api = {
  [key: string]: (...args: any[]) => any
}

export interface WrapOffchainEnvOptions<T, T2 extends Api, T3 extends Api> {
  createEnv: (walletName: SupportedWalletIds) => Promise<T>
  deleteEnv: (env: Awaited<ReturnType<WrapOffchainEnvOptions<T, T2, T3>['createEnv']>>) => Promise<void>
  envApi: (apiOptions: { env?: T }) => T2
}

export type WrapOffchainOptions<T, T2 extends Api, T3 extends Api> =
  (WrapOffchainEnvOptions<T, T2, T3> | {
    api: (apiOptions: {}) => T3
  }) &
  {
    api?: (apiOptions: {}) => T3
    queue?: boolean
    wallet?: Wallet
  }

export type Offchain = typeof wrapOffchain

export type OffchainClient<T, T2 extends Api, T3 extends Api> = {
  setWallet: (wallet: Wallet | undefined) => void
  getWallet: () => Wallet | undefined
  api: T2 & T3
}

export const wrapOffchain = <T, T2 extends Api, T3 extends Api>(options: WrapOffchainOptions<T, T2, T3>): OffchainClient<T, T2, T3> => {
  const queue = new PQueue({ concurrency: options.queue ? 1 : undefined })

  const apiFunctions: T3 | {} = options.api?.({}) ?? {}
  const envApiFunctions: T2 | {} = ('envApi' in options && options.envApi?.({})) || {}

  let wallet: Wallet | undefined
  let env: T | undefined

  const getEnv = async (): Promise<T> => {
    if (!wallet) throw new MissingWalletError('Tried generating an environment without a wallet set')
    if (!env) env = await (options as WrapOffchainEnvOptions<T, T2, T3>).createEnv(wallet.id)
    return env
  }

  const proxiedApi =
    Object.fromEntries(
      Object
      .entries(envApiFunctions)
      .map(([key, func]) => [
        key,
        (...args: Parameters<T2[number]>) => getEnv().then(env => func(env)(...args))
      ])
    )

  const api = Object.fromEntries(
    Object
      .entries({
        ...apiFunctions,
        ...proxiedApi
      })
      .map(([key, func]) => [
        key,
        (...args: Parameters<T2[number] & T3[number]>) => queue.add(() => func(...args))
      ])
  ) as T2 & T3

  return {
    setWallet: (_wallet) => {
      wallet = _wallet
    },
    getWallet: () => wallet,
    api
  }
}

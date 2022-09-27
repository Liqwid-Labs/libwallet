import PQueue from 'p-queue'
import { MissingWalletError, WalletError } from './utils/errors'
import { getWalletImpl, SupportedWalletIds } from './wallets'

export * from './wallets'

export type Wallet = Awaited<ReturnType<typeof makeWallet>>

export const makeWallet = <T extends SupportedWalletIds>({ id }: { id: T }) => {
  const walletImpl = getWalletImpl(id)

  const enable = () => walletImpl.cip30Wallet.enable()
  const isEnabled = () => walletImpl.cip30Wallet.isEnabled()

  const api = async () => {
    if (!await walletImpl.cip30Wallet.isEnabled()) throw new WalletError(`Wallet "${id}" not enabled`)
    return walletImpl.api()
  }

  return {
    id,
    enable,
    isEnabled,
    api
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
  setEnv: (wallet: T | undefined) => void
  getEnv: () => T | undefined
  setWallet: (wallet: Wallet | undefined) => void
  getWallet: () => Wallet | undefined
  api: T2 & T3
}

export const wrapOffchain = <T, T2 extends Api, T3 extends Api>(options: WrapOffchainOptions<T, T2, T3>): OffchainClient<T, T2, T3> => {
  const queue = new PQueue({ concurrency: options.queue ? 1 : Infinity })

  const apiFunctions: T3 | {} = options.api?.({}) ?? {}
  const envApiFunctions: T2 | {} = ('envApi' in options && options.envApi?.({})) || {}

  let wallet: Wallet | undefined = options.wallet
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
      // Wrap each env API functions around an environment
      .map(([key, func]) => [
        key,
        (...args: Parameters<T2[number]>) => getEnv().then(env => func(env)(...args))
      ] as const)
    )

  const api = Object.fromEntries(
    Object
      .entries({
        ...apiFunctions,
        ...proxiedApi
      })
      // Wrap each API functions around a queueing system
      .map(([key, func]) => [
        key,
        (...args: Parameters<T2[number] & T3[number]>) => queue.add(() => func(...args))
      ] as const)
      // Wrap each functions around a wallet check
      .map(([key, func]) => [
        key,
        async (...args: Parameters<T2[number] & T3[number]>) => {
          if (!wallet) throw new MissingWalletError('Tried calling an api function without a wallet')
          if (!await wallet.isEnabled()) throw new MissingWalletError('Tried calling an api function without a wallet enabled')
          return func(...args)
        }
      ] as const)
  ) as T2 & T3

  return {
    setEnv: (_env) => {
      env = _env
    },
    getEnv: () => env,
    setWallet: (_wallet) => {
      wallet = _wallet
    },
    getWallet: () => wallet,
    api
  }
}

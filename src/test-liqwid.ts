import type { WalletImpl, Wallet } from './index'
import { wrapOffchain, SUPPORTED_WALLETS, SupportedWalletIds } from './index'
import * as liqwid from '../liqwid-offchain'
import bigInt from 'big-integer'

// const wallet = makeWallet({ id: 'nami' })

// const liqwidClient = wrapOffchain({
//   wallet,
//   init: async (walletName) => ({
//     env: await liqwid.mkEnv({
//       // walletSpec: 'ConnectToNami',
//       ogmiosConfig: {
//         port: 1338,
//         host: 'markets-testnet-api.liqwid.finance',
//         secure: true,
//       },
//       datumCacheConfig: {
//         port: 9998,
//         host: 'markets-testnet-api.liqwid.finance',
//         secure: true,
//       }
//     })
//   }),
//   terminate: ({ context: { env } }) => liqwid.stopEnv(env),
//   api: ({ context: { env } }) => {
//     console.log('api env', env)
//     return ({
//       getMarkets: () => liqwid.getMarkets(env!),
//       borrow: async (marketID: string, borrow: liqwid.Foreign.Borrow) => (await liqwid.forMarketId(env!, marketID)).borrow(borrow),
//       loanerInfo: async (marketID: string) => (await liqwid.forMarketId(env!, marketID)).loanerInfo(),
//       mintQTokens: async (marketID: string, amount: BigInteger) => (await liqwid.forMarketId(env!, marketID)).mintQTokens(amount),
//       mintUnderlying: async (marketID: string, amount: BigInteger) => (await liqwid.forMarketId(env!, marketID)).mintUnderlying(amount),
//       modifyLoan: async (marketID: string, modifyLoan: liqwid.Foreign.ModifyLoan) => (await liqwid.forMarketId(env!, marketID)).modifyLoan(modifyLoan),
//       ownPubKey: async (marketID: string) => (await liqwid.forMarketId(env!, marketID)).ownPubKey(),
//       queryOraclePrices: async (marketID: string) => (await liqwid.forMarketId(env!, marketID)).queryOraclePrices(),
//       queryOwnerLoans: async (marketID: string, credential: liqwid.Foreign.AuthorizationCredential) => (await liqwid.forMarketId(env!, marketID)).queryOwnerLoans(credential),
//       redeemQTokens: async (marketID: string, amount: BigInteger) => (await liqwid.forMarketId(env!, marketID)).redeemQTokens(amount),
//       redeemUnderlying: async (marketID: string, amount: BigInteger) => (await liqwid.forMarketId(env!, marketID)).redeemUnderlying(amount),
//       repay: async (marketID: string, repay: liqwid.Foreign.Repay) => (await liqwid.forMarketId(env!, marketID)).repay(repay),
//     })
//   }
// })

const WALLETS_IMPL_MAP =
  Object.fromEntries(
    SUPPORTED_WALLETS
      .map(walletImpl => [
        walletImpl.id,
        walletImpl
      ] as const)
  ) as { [key in SupportedWalletIds]: Extract<WalletImpl, WalletImpl & { id: key }> }

const WALLETS_SPEC_MAP = {
  [WALLETS_IMPL_MAP.flint.id]: 'ConnectToFlint',
  [WALLETS_IMPL_MAP.gerowallet.id]: 'ConnectToGero',
  [WALLETS_IMPL_MAP.nami.id]: 'ConnectToNami'
} as const

const getWalletSpec = <T extends SupportedWalletIds>(walletId: T) => WALLETS_SPEC_MAP[walletId]

const makeLiqwid = (options?: { wallet?: Wallet }) => {
  const { wrapFunction } = wrapOffchain({
    wallet: options?.wallet,
    init: ({ wallet }) =>
      liqwid.mkEnv({
        walletSpec:
          wallet
            ? getWalletSpec(wallet.id)
            : undefined,
        ogmiosConfig: {
          port: 1338,
          host: 'markets-testnet-api.liqwid.finance',
          secure: true,
        },
        datumCacheConfig: {
          port: 9998,
          host: 'markets-testnet-api.liqwid.finance',
          secure: true,
        }
      }),
    terminate: (env) => liqwid.stopEnv(env),
  })

  // @ts-ignore
  type SkipFirstParameter<F> = F extends (x: any, ...args: infer P) => infer R ? P : never;

  // todo: try to remove the `as unknown`
  const forMarketId =
    <T extends (market: Awaited<ReturnType<typeof liqwid.forMarketId>>, ...args: any[]) => any>(func: T) =>
      wrapFunction(async (env, marketId: string, ...args) =>
        func(await liqwid.forMarketId(env, marketId), ...args)
      ) as unknown as (marketId: string, ...args: SkipFirstParameter<T>) => ReturnType<T>

  return {
    getMarkets: wrapFunction((env) => liqwid.getMarkets(env)),
    borrow: forMarketId((market, borrow: liqwid.Foreign.Borrow) => market.borrow(borrow)),
    loanerInfo: forMarketId((market) => market.loanerInfo()),
    mintQTokens: forMarketId((market, amount: bigint) => market.mintQTokens(bigInt(amount))),
    mintUnderlying: forMarketId((market, amount: bigint) => market.mintUnderlying(bigInt(amount))),
    modifyLoan: forMarketId((market, modifyLoan: liqwid.Foreign.ModifyLoan) => market.modifyLoan(modifyLoan)),
    ownPubKey: forMarketId((market) => market.ownPubKey()),
    queryOraclePrices: forMarketId((market) => market.queryOraclePrices()),
    queryOwnerLoans: forMarketId((market, credential: liqwid.Foreign.AuthorizationCredential) => market.queryOwnerLoans(credential)),
    redeemQTokens: forMarketId((market, amount: bigint) => market.redeemQTokens(bigInt(amount))),
    redeemUnderlying: forMarketId((market, amount: bigint) => market.redeemUnderlying(bigInt(amount))),
    repay: forMarketId((market, repay: liqwid.Foreign.Repay) => market.repay(repay))
  }
}


const liqwidClient = makeLiqwid()
console.log('liqwidClient', liqwidClient)

const markets = liqwidClient.getMarkets()
const loans = liqwidClient.loanerInfo('Ada')
console.log('markets', markets)
console.log('loans', loans)

export {}

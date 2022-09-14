import { pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/TaskEither'
import { ImportError } from './utils/errors'
import { toLovelace } from './utils/bigint'

export declare class MintUnderlying { constructor(quantity: bigint) }
export declare class RedeemQTokens { constructor(quantity: bigint) }
export declare class PubKey {}

export type Collateral = {
  qAda: bigint
}

export type BorrowRepayOptions = {
  amount: bigint
  collateral: Collateral
  owner: PubKey
}

export type mint = (marketId: string, quantity: MintUnderlying) => Promise<string>
export type redeem = (marketId: string, quantity: RedeemQTokens) => Promise<string>
export type borrow = (marketId: string, options: BorrowRepayOptions) => any
export type repay = (marketId: string, options: BorrowRepayOptions) => any
export type ownPubKey = (marketId: string) => Promise<PubKey>
export type queryOwnerLoans = (marketId: string, pubKey: PubKey) => any
export type queryOraclePrices = (marketId: string) => any
export type loanerInfo = (marketId: string) => any

export type LiqwidOffchainClient = {
  MintUnderlying: typeof MintUnderlying,
  RedeemQTokens: typeof RedeemQTokens,
  PubKey: PubKey,
  
  Collateral: Collateral,
  BorrowRepayOptions: BorrowRepayOptions,

  mint: mint,
  redeem: redeem,
  borrow: borrow,
  repay: repay,
  ownPubKey: ownPubKey,
  queryOwnerLoans: queryOwnerLoans,
  queryOraclePrices: queryOraclePrices,
  loanerInfo: loanerInfo
}

export const mint = ({ mint, MintUnderlying }: LiqwidOffchainClient) =>
  (amount: number, marketId: string) =>
    mint(marketId, new MintUnderlying(toLovelace(amount)))

export const redeem = ({ redeem, RedeemQTokens }: LiqwidOffchainClient) =>
  (amount: number, marketId: string) =>
    redeem(marketId, new RedeemQTokens(toLovelace(amount)))

export const borrow = ({ borrow, ownPubKey }: LiqwidOffchainClient) =>
  (amount: number, collateral: [{ amount: number }], marketId: string) =>
    ownPubKey(marketId)
      .then(pubKey =>
        borrow(
          marketId,
          {
            amount: toLovelace(amount),
            collateral: { qAda: toLovelace(collateral[0].amount) },
            owner: pubKey
          }
        )
      )

export const repay = ({ repay, ownPubKey }: LiqwidOffchainClient) =>
  (amount: number, collateral: [{ amount: number }], marketId: string) =>
    ownPubKey(marketId)
      .then(pubKey =>
        repay(
          marketId,
          {
            amount: toLovelace(amount),
            collateral: { qAda: toLovelace(collateral[0].amount) },
            owner: pubKey
          }
        )
      )


export const getLoans = ({ queryOwnerLoans, ownPubKey }: LiqwidOffchainClient) =>
  (marketId: string) =>
    ownPubKey(marketId)
      .then(pubKey => queryOwnerLoans(marketId, pubKey))
    

export const getOraclePrices = ({ queryOraclePrices }: LiqwidOffchainClient) =>
  (marketId: string) => queryOraclePrices(marketId)

export const getLoanerInfo = ({ loanerInfo }: LiqwidOffchainClient) =>
  (marketId: string) => loanerInfo(marketId)


export default pipe(
  TE.tryCatch(
    () => import('liqwid-offchain') as Promise<LiqwidOffchainClient>,
    () => new ImportError('Liqwid client dynamic import failed'),
  ),
  TE.map((client) => {

    return {
      mint: mint(client),
      redeem: redeem(client),
      borrow: borrow(client),
      repay: repay(client),
      getLoans: getLoans(client),
      getOraclePrices: getOraclePrices(client),
      getLoanerInfo: getLoanerInfo(client)
    }
  })
)

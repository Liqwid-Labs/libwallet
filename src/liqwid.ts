import { flow, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'

import { cache } from './utils/fp-ts'

export class ImportError extends Error {}

export interface Quantity { constructor(tag: string, value: number) }
export interface MintUnderlying { constructor(quantity: Quantity) }
export interface RedeemQTokens { constructor(quantity: Quantity) }

type PubKey = {
  // marketId: 'Ada'
}

type Collateral = {
  qAda: BigInt
}

type BorrowRepayOptions = {
  amount: BigInt
  collateral: Collateral
  owner: PubKey
}

// mint: (marketId: string) => (quantity: Quantity) => () => Promise<any>
// redeem: (marketId: string) => (quantity: Quantity) => () => Promise<any>
type LiqwidClient = {
  mint: (marketId: 'Ada', quantity: MintUnderlying) => Promise<string>
  redeem: (marketId: 'Ada', quantity: RedeemQTokens) => Promise<string>
  borrow: (marketId: 'Ada', options: BorrowRepayOptions) => any
  repay: (marketId: 'Ada', options: BorrowRepayOptions) => any
  MintUnderlying: MintUnderlying
  RedeemQTokens: RedeemQTokens
  ownPubKey: (marketId: 'Ada') => Promise<PubKey>
  queryOwnerLoans: (marketId: 'Ada', pubKey: PubKey) => any
  queryOraclePrices: (marketId: 'Ada') => any
  loanerInfo: (marketId: 'Ada') => any
}

export default pipe(
  TE.tryCatch(
    () => import('../../liqwid-offchain/') as Promise<LiqwidClient>,
    () => new ImportError('Liqwid client dynamic import failed'),
  ),
  TE.map((client) => {
    

    return ({
      
    })
  }),
  cache
)

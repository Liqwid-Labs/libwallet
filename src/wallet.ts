// import type { WindowMaybeWithCardano } from '@cardano-sdk/cip30'

// import type { WalletImpl } from './wallets'

// import * as E from 'fp-ts/Either'

// import { WALLETS } from './wallets'
// import { flow } from 'fp-ts/lib/function'

// export class MissingWalletError extends Error {}
// export class UnsupportedWalletError extends Error {}

// export const hasWallet = (name: WalletImpl['id']) =>
//   WALLETS.some(({ id }) => id === name) &&
//   !!(window as WindowMaybeWithCardano).cardano?.[name]

// export const isWalletSupported = (name: WalletImpl['id']) =>
//   !!WALLETS.find(({ id }) => id === name)?.supported

// export const getWallet = flow(
//   E.fromPredicate(hasWallet, name => new MissingWalletError(`No "${name}" wallet found`)),
//   E.chainW(E.fromPredicate(isWalletSupported, name => new UnsupportedWalletError(`Wallet "${name}" not supported`))),
//   E.map((name) => {
    
//     return ({
//       hasCollateral: () => {},
//       getBalance: () => {}
//     })
//   })
// )

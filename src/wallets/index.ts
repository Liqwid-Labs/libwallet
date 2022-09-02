import type { WindowMaybeWithCardano } from '@cardano-sdk/cip30'

import type { WalletImplType } from '../types/wallet'

import { flow, identity, pipe } from 'fp-ts/lib/function'
import * as E from 'fp-ts/Either'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/lib/Task'

import { MissingWalletError, UnsupportedWalletError } from '../utils/errors'
import * as Yoroi from './yoroi'
import * as Gero from './gero'
import * as Nami from './nami'

export type Wallets = typeof WALLETS_IMPLS
export type WalletImpl = Wallets[number]
const WALLETS_IMPLS = [
  Yoroi,
  Gero,
  Nami
]

export const WALLETS: WalletImplType[] = WALLETS_IMPLS

export const isWalletSupported = (name: WalletImpl['id']): name is WalletImpl['id'] =>
  !!WALLETS.find(({ id }) => id === name)?.supported

export const hasWallet = (name: WalletImpl['id']): name is WalletImpl['id'] =>
  WALLETS.some(({ id }) => id === name) &&
  !!(window as WindowMaybeWithCardano).cardano?.[name]

export const getWalletImpl = flow(
  TE.fromPredicate(isWalletSupported, name => new UnsupportedWalletError(`Wallet "${name}" not supported`)),
  TE.chainW(
    TE.fromPredicate(hasWallet, name => new MissingWalletError(`No "${name}" wallet found`))
  ),
  TE.chainW(name =>
    TE.tryCatch(() => (window as WindowMaybeWithCardano).cardano?.[name]?.enable() || Promise.reject(), E.toError)
  )
)

export class UnknownError extends Error {}
export class FetchError extends Error {
  statusCode: number
  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode
  }
}

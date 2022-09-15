import type { WindowMaybeWithCardano } from '@cardano-sdk/cip30'

import type { WalletImplType } from '../types/wallet'

import { MissingWalletError, UnsupportedWalletError } from '../utils/errors'
import * as Yoroi from './yoroi'
import * as Gero from './gero'
import * as Nami from './nami'
import * as Flint from './flint'

const WALLETS_IMPLS = [
  Yoroi,
  Gero,
  Nami,
  Flint
]

export type Wallets = typeof WALLETS_IMPLS
export type WalletImpl = Wallets[number]
export type SupportedWalletIds = Extract<WalletImpl, { supported: true }>['id']

export const WALLETS: WalletImplType[] = WALLETS_IMPLS

export const isWalletSupported = (name: WalletImpl['id']): name is WalletImpl['id'] =>
  !!WALLETS.find(({ id }) => id === name)?.supported

export const hasWallet = (name: WalletImpl['id']): name is WalletImpl['id'] =>
  WALLETS.some(({ id }) => id === name) &&
  !!(window as WindowMaybeWithCardano).cardano?.[name]

export const getWalletImpl = (name: WalletImpl['id']) => {
  if (!isWalletSupported(name)) throw new UnsupportedWalletError(`Wallet "${name}" not supported`)
  if (!hasWallet(name)) throw new MissingWalletError(`No "${name}" wallet found`)
  return (window as WindowMaybeWithCardano).cardano?.[name]?.enable()
}

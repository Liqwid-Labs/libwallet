import type { Cip30Wallet, WindowMaybeWithCardano } from '@cardano-sdk/cip30'

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
export type SupportedWallet = Extract<WalletImpl, { supported: true }>
export type SupportedWalletId = SupportedWallet['id']

export const WALLETS: WalletImplType[] = WALLETS_IMPLS
export const SUPPORTED_WALLETS = WALLETS_IMPLS.filter(({ supported }) => supported) as SupportedWallet[]

export const isWalletSupported = (id: WalletImpl['id']): id is WalletImpl['id'] =>
  !!WALLETS.find(({ id: _id }) => _id === id)?.supported

export const getSupportedWallet = <T extends SupportedWalletId>(id: T) => {
  const wallet = SUPPORTED_WALLETS.find(({ id: _id }) => _id === id)
  if (!wallet) throw new MissingWalletError(`No "${id}" wallet found`)
  return wallet as Extract<SupportedWallet, { id: T }>
}

export const hasWallet = (id: WalletImpl['id']): id is WalletImpl['id'] =>
  WALLETS.some(({ id: _id }) => _id === id) &&
  !!(window as WindowMaybeWithCardano).cardano?.[id]

export const getCip30Wallet = (id: WalletImpl['id']): Cip30Wallet => {
  const cardano = (window as WindowMaybeWithCardano).cardano
  const wallet = cardano?.[id]
  if (!cardano || !wallet) throw new MissingWalletError(`No wallet found`)
  if (!isWalletSupported(id)) throw new UnsupportedWalletError(`Wallet "${id}" not supported`)
  if (!hasWallet(id)) throw new MissingWalletError(`No "${id}" wallet found`)
  return wallet
}

export const isWalletEnabled = <T extends SupportedWalletId>(id: T) => getCip30Wallet(id).isEnabled()

export const getWalletApi = (id: WalletImpl['id']) => getCip30Wallet(id).enable()

export const getWalletImpl = <T extends SupportedWalletId>(id: T) => ({
  wallet: getSupportedWallet(id),
  cip30Wallet: getCip30Wallet(id),
  getApi: () => getWalletApi(id)
})


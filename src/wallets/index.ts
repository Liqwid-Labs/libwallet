import type { Cip30Wallet, WindowMaybeWithCardano } from '@cardano-sdk/cip30'

import type { WalletImplType } from '../types/wallet'

import { MissingWalletError, UnsupportedWalletError } from '../utils/errors'
import * as Yoroi from './yoroi'
import * as Gero from './gero'
import * as Nami from './nami'
import * as Flint from './flint'
import * as Eternl from './eternl'
import * as Lace from './lace'
import * as Nufi from './nufi'

const _WALLETS_IMPLS = [
  Yoroi,
  Gero,
  Nami,
  Flint,
  Eternl,
  Lace,
  Nufi
]

const installedWallets =
  Object
    .entries(((window as WindowMaybeWithCardano).cardano ?? {}))
    .filter(([_, wallet]) =>
      wallet.apiVersion
      && wallet.name
      && wallet.icon
      // @ts-expect-error
      && wallet.enable
      && wallet.isEnabled
    )
    .map(([id, wallet]) => ({
      id,
      name: wallet.name,
      icon: wallet.icon,
      supported: true,
      init: () => {},
      origin: ''
    }))
    .filter(({ id }) => id !== 'ccvault')
    .filter(({ id }) => !_WALLETS_IMPLS.some(({ id: _id }) => _id === id))

const WALLETS_IMPLS = [..._WALLETS_IMPLS, ...installedWallets] as typeof _WALLETS_IMPLS

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

export const isWalletEnabled = async <T extends SupportedWalletId>(id: T) => getCip30Wallet(id).isEnabled()

export const getWalletApi = async (id: WalletImpl['id']) => getCip30Wallet(id).enable()

export const getWalletImpl = <T extends SupportedWalletId>(id: T) => ({
  wallet: getSupportedWallet(id),
  cip30Wallet: getCip30Wallet(id),
  getApi: () => getWalletApi(id)
})

export const getWalletIcon = (id: WalletImpl['id']): string | undefined => {
  const cardano = (window as WindowMaybeWithCardano).cardano
  return cardano?.[id]?.icon;
}

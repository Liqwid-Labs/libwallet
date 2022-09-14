import { flow, pipe } from 'fp-ts/lib/function'
import * as TE from 'fp-ts/lib/TaskEither'
import { ImportError } from './utils/errors'
import { getWalletImpl } from './wallets'

import makeLiqwid from './liqwid'

export const makeWallet = async ({ name }: { name: Parameters<typeof getWalletImpl>[0] }) => {
  const walletImpl = await getWalletImpl(name)

  return {
    
  }
}

export const wrapApi = <T>(func: TE.TaskEither<Error, any>): TE.TaskEither<ImportError, T> =>
  pipe(
    func,
    TE.map(offchain => {
      console.log('offchain', offchain)
      return offchain
    })
  )

export const wrapFunction =
  flow(
    TE.map(<T, T2>(offchain: (...args: T[]) => T2) => {
      console.log('offchain', offchain)
      return (...args: T[]) => offchain(...args)
    })
  )

const redeem = pipe(
  makeLiqwid,
  TE.map(api => api.redeem)
)

const geroWallet = makeWallet({ name: 'gero' })

const wrappedRedeem = wrapFunction(redeem)(geroWallet)

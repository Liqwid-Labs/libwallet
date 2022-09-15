import { makeWallet, wrapOffchain } from './index'
import * as agora from 'agora-offchain'
import bigInt from 'big-integer'
import { TransactionInput } from '@emurgo/cardano-serialization-lib-browser'

const geroWallet = makeWallet({ name: 'gero' })

type FromInitialSpendApi = Awaited<ReturnType<typeof agora.fromInitialSpend>>

const wrapFromInitialSpendApi =
  (env: agora.Foreign.ContractEnv) =>
    <T extends keyof FromInitialSpendApi, T2 extends any[]>(key: T, func: (initialSpendFunc: FromInitialSpendApi[T], ...params: T2) => ReturnType<FromInitialSpendApi[T]>) =>
      (initialSpend: TransactionInput, ...params: T2) =>
        agora
          .fromInitialSpend(env, initialSpend)
          .then(fromInitialSpendApi => func(fromInitialSpendApi[key], ...params))

const simpleWrapFromInitialSpendApi =
  (env: agora.Foreign.ContractEnv) =>
    <T extends keyof FromInitialSpendApi>(key: T) =>
      (initialSpend: TransactionInput, ...params: Parameters<FromInitialSpendApi[T]>) =>
        agora
          .fromInitialSpend(env, initialSpend)
          .then(fromInitialSpendApi => (fromInitialSpendApi[key] as (...args: any[]) => ReturnType<FromInitialSpendApi[T]>)(...params))

const agoraClient = wrapOffchain({
  wallet: geroWallet,
  api: () =>  ({
    runDashboard: agora.runDashboard
  }),
  createEnv: (name) => agora.mkEnv((`${name[0].toUpperCase()}${name.slice(1)}`) as Capitalize<typeof name>),
  deleteEnv: (env) => agora.stopEnv(env),
  envApi: ({ env }) => ({
    createUtxo: () => agora.createUtxo(env!),
    bootstrap: () => agora.bootstrap(env!),
    createStake: wrapFromInitialSpendApi(env!)(
      'createStake',
      (createStake, amount: bigint) => createStake(bigInt(amount.toString()))
    ),
    destroyStake: simpleWrapFromInitialSpendApi(env!)('destroyStake'),
    depositToOwnedStake: wrapFromInitialSpendApi(env!)(
      'depositToOwnedStake',
      (depositToOwnedStake, amount: bigint) => depositToOwnedStake(bigInt(amount.toString()))
    ),
    withdrawFromOwnedStake: wrapFromInitialSpendApi(env!)(
      'withdrawFromOwnedStake',
      (withdrawFromOwnedStake, amount: bigint) => withdrawFromOwnedStake(bigInt(amount.toString()))
    ),
    voteOnProposal: simpleWrapFromInitialSpendApi(env!)('voteOnProposal'),
    retractVote: simpleWrapFromInitialSpendApi(env!)('retractVote')
  })
})

agoraClient.api.bootstrap()

console.log('agoraClient', agoraClient)

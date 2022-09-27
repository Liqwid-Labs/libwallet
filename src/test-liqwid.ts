// import { makeWallet, wrapOffchain } from './index'
// import * as liqwid from './liqwid'

// const geroWallet = makeWallet({ id: 'gerowallet' })

// const liqwidClient = wrapOffchain({
//   wallet: geroWallet,
//   api: () => ({
//     mint: liqwid.mint,
//     redeem: liqwid.redeem,
//     borrow: liqwid.borrow,
//     repay: liqwid.repay,
//     getLoans: liqwid.getLoans,
//     getOraclePrices: liqwid.getOraclePrices,
//     getLoanerInfo: liqwid.getLoanerInfo
//   })
// })

// // console.log(geroWallet.isEnabled())

// geroWallet
//   .isEnabled()
//   .then(enabled => {
//     console.log('enabled', enabled)
//     // geroWallet.enable()
//   })

// // liqwidClient.api.getLoanerInfo('Ada').then(res => console.log(res))

// console.log('liqwidClient', liqwidClient)
export {}

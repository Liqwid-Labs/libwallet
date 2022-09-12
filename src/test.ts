// import { makeWallet, wrapApi } from './index'
// import makeLiqwid from './liqwid'

// console.log('foo')

// const geroWallet = makeWallet({ name: 'gero' })

// const geroOffchain = wrapApi(makeLiqwid)

// console.log('wallet', geroWallet)


// import('../../lq-app/liqwid-offchain')
import('liqwid-offchain')
  .then((mod) => {
    console.log('mod', mod)
  })
console.log('yee')

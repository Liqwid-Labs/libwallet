import * as E from 'fp-ts/Either'

const uniqueSymbol = Symbol('cache - never ran')

export const cache = <A>(fn: () => A): (() => A) => {
  let cache: symbol | A = uniqueSymbol
  return () => {
    if (cache !== uniqueSymbol) return cache as A

    const val = fn()
    if (!E.isLeft(val as any)) {
      cache = val
    }
    if (cache instanceof Promise) {
      cache
        .then(out => {
          if (E.isLeft(out)) {
            cache = uniqueSymbol
          }
        })
        .catch(() => {
          cache = uniqueSymbol
        })
    }
    return val as A
  }
}

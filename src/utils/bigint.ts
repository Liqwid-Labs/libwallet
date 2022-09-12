// https://stackoverflow.com/a/54409977
// max precision is 2^2147483648 - 1 as per https://stackoverflow.com/a/70537884
export const divide = (
  number: bigint,
  denominator: bigint,
  { precision = 20 }: { precision: number }
) => {
  const bigInt = (number * BigInt('1' + '0'.repeat(precision))) / denominator
  const str = bigInt.toString().padStart(precision + 1, '0')
  return  `${str.slice(0, -precision)}.${str.slice(-precision).replace(/\.?0+$/, '')}`
}

const lovelace = 1_000_000
const lovelaceBigInt = BigInt(lovelace)

export const toLovelace = (amount: number) => BigInt(amount) * lovelaceBigInt

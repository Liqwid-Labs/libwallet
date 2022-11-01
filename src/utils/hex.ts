type HexPrimitive = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0 | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'
type HexPart<S extends string | number> = `${S}${''|`${S}`}`
export type Hex = HexPart<HexPart<HexPrimitive>>

export const isHex = (hex: string): hex is Hex => !hex.match(/[^\da-f]/)

// todo: replace these with something more efficient, should be pretty slow compared to a for loop
export const hexToUint8 = (hex: Hex) =>
  new Uint8Array(
    hex
    .match(/../g)!
    .map(h=> parseInt(h, 16))
  )

export const uint8ToHex = (buffer: Uint8Array) =>
  [...buffer]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')

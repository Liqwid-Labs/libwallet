import type { Hex } from './hex'

import { Address } from '@emurgo/cardano-serialization-lib-browser'

import { hexToUint8 } from './hex'

export const getBech32Address = (hex: Hex) => Address.from_bytes(hexToUint8(hex)).to_bech32()


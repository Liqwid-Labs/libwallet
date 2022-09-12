import { getWalletImpl } from './wallets'

export const makeWallet = async ({ name }: { name: Parameters<typeof getWalletImpl>[0] }) => {
  const walletImpl = await getWalletImpl(name)


  return {
    
  }
}

export const wrapApi = (func: (...args: any[]) => any) => {

}

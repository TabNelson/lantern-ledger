import { coinbaseWallet, injected } from "wagmi/connectors";
import { base } from "wagmi/chains";
import { createConfig, http } from "wagmi";
import type { EIP1193Provider } from "viem";

export const contractAddress = (
  process.env.NEXT_PUBLIC_LANTERN_LEDGER_ADDRESS ??
  "0xfbf59F0240e83B05A4DD1ADbcacE638dCAd2FbC9"
) as `0x${string}`;

export const builderCode =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "bc_cduxjtls";

export const attributionSuffix = (process.env.NEXT_PUBLIC_BASE_ATTRIBUTION_SUFFIX ??
  "0x62635f636475786a746c730b0080218021802180218021802180218021") as `0x${string}`;

export const isContractConfigured =
  contractAddress !== "0x0000000000000000000000000000000000000000";

type InjectedWalletProvider = EIP1193Provider & {
  isOkxWallet?: true;
  isOKExWallet?: true;
  providers?: InjectedWalletProvider[];
};

type WalletWindow = {
  ethereum?: InjectedWalletProvider;
  okxwallet?: InjectedWalletProvider;
};

function getOkxProvider(window?: unknown) {
  const walletWindow = window as WalletWindow | undefined;
  const okxProvider = walletWindow?.okxwallet;
  const ethereum = walletWindow?.ethereum;

  if (okxProvider) return okxProvider;
  if (ethereum?.isOkxWallet || ethereum?.isOKExWallet) return ethereum;

  return ethereum?.providers?.find(
    (provider) => provider.isOkxWallet || provider.isOKExWallet,
  );
}

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({
      target() {
        return {
          id: "okx-wallet",
          name: "OKX Wallet",
          provider: getOkxProvider as never,
        };
      },
      unstable_shimAsyncInject: 1_500,
    }),
    injected({
      target: "metaMask",
    }),
    injected({
      target() {
        return {
          id: "base-injected",
          name: "Base App",
          provider: (window) => window?.ethereum,
        };
      },
    }),
    coinbaseWallet({
      appName: "Lantern Ledger",
      preference: "smartWalletOnly",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
});

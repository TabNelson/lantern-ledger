import { coinbaseWallet, injected } from "wagmi/connectors";
import { base } from "wagmi/chains";
import { createConfig, http } from "wagmi";
import { Attribution } from "ox/erc8021";

export const contractAddress = (
  process.env.NEXT_PUBLIC_LANTERN_LEDGER_ADDRESS ??
  "0xfbf59F0240e83B05A4DD1ADbcacE638dCAd2FbC9"
) as `0x${string}`;

export const builderCode =
  process.env.NEXT_PUBLIC_BASE_BUILDER_CODE ?? "bc_lantern_ledger_pending";

export const attributionSuffix = Attribution.toDataSuffix({
  codes: [builderCode],
}) as `0x${string}`;

export const isContractConfigured =
  contractAddress !== "0x0000000000000000000000000000000000000000";

export const config = createConfig({
  chains: [base],
  connectors: [
    injected({
      target: "okxWallet",
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

"use client";

import {
  Anchor,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Flame,
  Loader2,
  LogOut,
  RadioTower,
  ShieldCheck,
  ShipWheel,
  Waves,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  useChainId,
  useConnect,
  useConnection,
  useDisconnect,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import type { Connector } from "wagmi";
import { lanternLedgerAbi } from "@/lib/abi";
import {
  attributionSuffix,
  builderCode,
  contractAddress,
  isContractConfigured,
} from "@/lib/wagmi";

type ActionKey = "lights" | "bells" | "safes";

const actionConfig = [
  {
    key: "lights",
    label: "Light Beacon",
    method: "lightBeacon",
    myLabel: "My Lights",
    totalLabel: "Total Lights",
    icon: Flame,
    className: "border-orange-600 bg-orange-600 text-white hover:bg-orange-700",
  },
  {
    key: "bells",
    label: "Ring Bell",
    method: "ringBell",
    myLabel: "My Bells",
    totalLabel: "Total Bells",
    icon: Bell,
    className: "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800",
  },
  {
    key: "safes",
    label: "Mark Safe",
    method: "markSafe",
    myLabel: "My Safe Marks",
    totalLabel: "Total Safe Marks",
    icon: ShieldCheck,
    className: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
  },
] as const;

const zeroAddress = "0x0000000000000000000000000000000000000000" as const;

function shortAddress(address?: string) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatCount(value: unknown) {
  if (typeof value === "bigint") return value.toLocaleString("en-US");
  return "0";
}

function getConnectorLabel(connector: Connector) {
  const lowerName = connector.name.toLowerCase();
  if (connector.id.includes("coinbase") || lowerName.includes("coinbase")) {
    return "Coinbase Wallet";
  }
  if (connector.id.includes("okx") || lowerName.includes("okx")) {
    return "OKX Wallet";
  }
  if (connector.id.includes("metaMask") || lowerName.includes("metamask")) {
    return "MetaMask";
  }
  if (connector.id.includes("base")) return "Base App";
  if (connector.id === "injected") return "Injected Wallet";
  return connector.name;
}

export function LanternLedgerApp() {
  const [walletOpen, setWalletOpen] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionKey | null>(null);
  const [lastTx, setLastTx] = useState<`0x${string}` | null>(null);
  const [lastMessage, setLastMessage] = useState("No transaction yet");
  const { address, isConnected, connector } = useConnection();
  const chainId = useChainId();
  const { connectors, connect, isPending: isConnectPending } = useConnect({
    mutation: {
      onSuccess() {
        setWalletOpen(false);
      },
    },
  });
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const reads = useMemo(
    () =>
      [
        {
          address: contractAddress,
          abi: lanternLedgerAbi,
          functionName: "userLights",
          args: [address ?? zeroAddress],
        },
        {
          address: contractAddress,
          abi: lanternLedgerAbi,
          functionName: "userBells",
          args: [address ?? zeroAddress],
        },
        {
          address: contractAddress,
          abi: lanternLedgerAbi,
          functionName: "userSafes",
          args: [address ?? zeroAddress],
        },
        {
          address: contractAddress,
          abi: lanternLedgerAbi,
          functionName: "totalLights",
        },
        {
          address: contractAddress,
          abi: lanternLedgerAbi,
          functionName: "totalBells",
        },
        {
          address: contractAddress,
          abi: lanternLedgerAbi,
          functionName: "totalSafes",
        },
      ] as const,
    [address],
  );

  const {
    data: counts,
    isFetching: isReading,
    refetch,
  } = useReadContracts({
    contracts: reads,
    query: {
      enabled: isContractConfigured,
      refetchInterval: 12_000,
    },
  });

  const { writeContractAsync, isPending: isWriting } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: lastTx ?? undefined,
      query: {
        enabled: Boolean(lastTx),
      },
    });

  const displayCounts = {
    lights: {
      mine: formatCount(counts?.[0]?.result),
      total: formatCount(counts?.[3]?.result),
    },
    bells: {
      mine: formatCount(counts?.[1]?.result),
      total: formatCount(counts?.[4]?.result),
    },
    safes: {
      mine: formatCount(counts?.[2]?.result),
      total: formatCount(counts?.[5]?.result),
    },
  };

  async function runAction(action: (typeof actionConfig)[number]) {
    if (!isConnected) {
      setWalletOpen(true);
      return;
    }

    if (!isContractConfigured) {
      setLastMessage("Contract address is not configured");
      return;
    }

    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }

    setActiveAction(action.key);
    setLastMessage(`${action.label} pending`);

    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: lanternLedgerAbi,
        functionName: action.method,
        dataSuffix: attributionSuffix,
      });

      setLastTx(hash);
      setLastMessage(`${action.label} submitted`);
      await refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed";
      setLastMessage(message.split("\n")[0] ?? "Transaction failed");
      setActiveAction(null);
    }
  }

  const busy = isWriting || isConfirming || isSwitching;
  const configuredLabel = isContractConfigured ? "Ready" : "Needs contract";

  return (
    <main className="min-h-screen bg-[#f5f4ef] text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-950/15 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center border-2 border-zinc-950 bg-white shadow-[3px_3px_0_#111]">
              <RadioTower className="h-6 w-6 text-orange-600" aria-hidden />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-600">
                Harbor signal station
              </p>
              <h1 className="text-2xl font-black leading-tight sm:text-4xl">
                Lantern Ledger
              </h1>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                isConnected ? disconnect() : setWalletOpen((open) => !open)
              }
              className="inline-flex h-11 items-center gap-2 border-2 border-zinc-950 bg-white px-3 text-sm font-bold shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111]"
            >
              {isConnected ? (
                <LogOut className="h-4 w-4" aria-hidden />
              ) : (
                <ChevronDown className="h-4 w-4" aria-hidden />
              )}
              {isConnected ? shortAddress(address) : "Connect Wallet"}
            </button>

            {walletOpen && !isConnected ? (
              <div className="absolute right-0 z-20 mt-3 w-72 border-2 border-zinc-950 bg-white p-3 shadow-[5px_5px_0_#111]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-600">
                    Choose wallet
                  </p>
                  <button
                    type="button"
                    onClick={() => setWalletOpen(false)}
                    className="grid h-7 w-7 place-items-center border border-zinc-300 hover:border-zinc-950"
                    aria-label="Close wallet menu"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="grid gap-2">
                  {connectors.map((walletConnector) => (
                    <button
                      key={`${walletConnector.id}-${walletConnector.uid}`}
                      type="button"
                      disabled={isConnectPending}
                      onClick={() => connect({ connector: walletConnector })}
                      className="flex min-h-11 items-center justify-between border border-zinc-300 px-3 text-left text-sm font-semibold transition hover:border-zinc-950 hover:bg-[#f5f4ef] disabled:cursor-wait disabled:opacity-60"
                    >
                      <span>{getConnectorLabel(walletConnector)}</span>
                      <Anchor className="h-4 w-4 text-blue-600" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-5">
            <div className="border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_#111] sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-600">
                    Signal controls
                  </p>
                  <h2 className="mt-1 text-xl font-black sm:text-2xl">
                    Log an onchain signal
                  </h2>
                </div>
                <div className="flex items-center gap-2 border border-blue-500/40 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                  <Waves className="h-4 w-4" aria-hidden />
                  Base
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {actionConfig.map((action) => {
                  const Icon = action.icon;
                  const isActive = activeAction === action.key && busy;
                  return (
                    <button
                      key={action.key}
                      type="button"
                      disabled={busy}
                      onClick={() => runAction(action)}
                      className={`flex min-h-28 flex-col justify-between border-2 p-4 text-left shadow-[3px_3px_0_#111] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#111] disabled:cursor-wait disabled:opacity-70 ${action.className}`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <Icon className="h-7 w-7" aria-hidden />
                        {isActive ? (
                          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        ) : null}
                      </span>
                      <span className="text-lg font-black leading-tight">
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {actionConfig.map((action) => (
                <div
                  key={action.key}
                  className="border-2 border-zinc-950 bg-white p-4 shadow-[3px_3px_0_#111]"
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    {action.myLabel}
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {displayCounts[action.key].mine}
                  </p>
                  <div className="mt-4 h-px bg-zinc-950/15" />
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                    {action.totalLabel}
                  </p>
                  <p className="mt-2 text-2xl font-black text-zinc-800">
                    {displayCounts[action.key].total}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="border-2 border-zinc-950 bg-white p-4 shadow-[5px_5px_0_#111]">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-600">
                  Station status
                </p>
                <ShipWheel className="h-5 w-5 text-orange-600" aria-hidden />
              </div>

              <div className="mt-4 grid gap-3">
                <StatusRow
                  label="Wallet Status"
                  value={
                    isConnected
                      ? `${getConnectorLabel(connector as Connector)} connected`
                      : "Disconnected"
                  }
                  tone={isConnected ? "green" : "neutral"}
                />
                <StatusRow
                  label="Network"
                  value={chainId === base.id ? "Base mainnet" : "Switch to Base"}
                  tone={chainId === base.id ? "green" : "orange"}
                />
                <StatusRow
                  label="Contract"
                  value={configuredLabel}
                  tone={isContractConfigured ? "green" : "orange"}
                />
                <StatusRow
                  label="Last Transaction"
                  value={
                    lastTx
                      ? `${shortAddress(lastTx)} ${
                          isConfirmed ? "confirmed" : "submitted"
                        }`
                      : lastMessage
                  }
                  tone={
                    isConfirming
                      ? "orange"
                      : isConfirmed
                        ? "green"
                        : lastMessage.toLowerCase().includes("failed") ||
                            lastMessage.toLowerCase().includes("rejected")
                          ? "red"
                          : "neutral"
                  }
                />
              </div>
            </div>

            <div className="border-2 border-zinc-950 bg-[#111] p-4 text-white shadow-[5px_5px_0_#f97316]">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-zinc-300">
                Attribution
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-zinc-400">Builder Code</dt>
                  <dd className="break-all font-mono text-white">{builderCode}</dd>
                </div>
                <div>
                  <dt className="text-zinc-400">ERC-8021 Suffix</dt>
                  <dd className="break-all font-mono text-white">
                    {attributionSuffix}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-400">Contract Address</dt>
                  <dd className="break-all font-mono text-white">
                    {contractAddress}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="border border-zinc-950/15 bg-white/70 p-4">
              <div className="flex items-start gap-3">
                {isReading ? (
                  <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-blue-600" />
                ) : isContractConfigured ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                ) : (
                  <CircleAlert className="mt-0.5 h-5 w-5 text-orange-600" />
                )}
                <p className="text-sm leading-6 text-zinc-700">
                  No token, no points, no rewards, no invite loop. Each signal
                  is a repeatable Base transaction and only requires gas.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "orange" | "red" | "neutral";
}) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-500/40",
    orange: "bg-orange-50 text-orange-700 border-orange-500/40",
    red: "bg-red-50 text-red-700 border-red-500/40",
    neutral: "bg-zinc-50 text-zinc-700 border-zinc-300",
  }[tone];

  return (
    <div className="grid gap-1 border-b border-zinc-950/10 pb-3 last:border-b-0 last:pb-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </dt>
      <dd
        className={`inline-flex w-fit max-w-full border px-2 py-1 text-sm font-bold ${toneClass}`}
      >
        <span className="truncate">{value}</span>
      </dd>
    </div>
  );
}

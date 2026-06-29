# Lantern Ledger

Lantern Ledger is a compact Base Mini App for recording three repeatable onchain signals:

- Light Beacon
- Ring Bell
- Mark Safe

The app is intentionally simple. It does not include points, rewards, referrals, or app fees.

Users only pay the Base network gas required for the contract transaction.

## Overview

Lantern Ledger provides a small interface for writing simple signal events to an onchain contract.

Each action can be performed repeatedly by a connected wallet:

- **Light Beacon** records a light signal.
- **Ring Bell** records a bell signal.
- **Mark Safe** records a safety signal.

The app also reads user-specific and global totals from the contract.

## Repository

Repository URL:

https://github.com/TabNelson/lantern-ledger.git

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Wagmi
- Viem

## Features

- Minimal Base Mini App interface
- Three repeatable contract actions
- Per-user counters for each action
- Global totals for each action
- Contract reads and writes through Wagmi and Viem
- Base App iframe support through deployment headers

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app locally:

```text
http://localhost:3000
```

## Required Configuration

Create a local environment file from the example file:

```bash
cp .env.example .env.local
```

Set the following values in `.env.local`:

```bash
NEXT_PUBLIC_LANTERN_LEDGER_ADDRESS=0xYourDeployedContract
NEXT_PUBLIC_BASE_BUILDER_CODE=bc_xxxxxx
```

`NEXT_PUBLIC_LANTERN_LEDGER_ADDRESS` should point to the deployed `LanternLedger` contract.

`NEXT_PUBLIC_BASE_BUILDER_CODE` is used for Base builder attribution.

## Base App Verification

The Base verification tag is written directly in `app/layout.tsx`.

Update the placeholder value before deployment:

```tsx
<meta name="base:app_id" content="YOUR_BASE_DEV_VERIFY_VALUE" />
```

The tag is intentionally placed directly inside `<head>` for base.dev offchain attribution verification.

## Contract

The Solidity source is located at:

```text
contracts/LanternLedger.sol
```

The frontend ABI is located at:

```text
lib/abi.ts
```

The ABI matches the following contract reads and writes:

- `userLights(address)`
- `userBells(address)`
- `userSafes(address)`
- `totalLights()`
- `totalBells()`
- `totalSafes()`
- `lightBeacon()`
- `ringBell()`
- `markSafe()`

## Frontend Contract Usage

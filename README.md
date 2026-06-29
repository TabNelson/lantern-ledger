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

The main app component is located at:

```text
components/LanternLedgerApp.tsx
```

This component performs contract reads for user and total counts.

It also sends the three contract write actions:

- `lightBeacon`
- `ringBell`
- `markSafe`

## Attribution

`lib/wagmi.ts` builds an ERC-8021 calldata suffix from `NEXT_PUBLIC_BASE_BUILDER_CODE` using `ox/erc8021`.

Each `writeContractAsync` call in `components/LanternLedgerApp.tsx` explicitly passes the suffix:

```ts
dataSuffix: attributionSuffix
```

After setting the real builder code, inspect a Basescan transaction input and confirm that the encoded string appears at the end of the calldata.

## Deployment Notes

`vercel.json` allows iframe embedding for Base App access.

After deploying on Vercel, disable Deployment Protection for the production deployment.

A typical deployment flow is:

```bash
git remote add origin https://github.com/YOUR_NAME/lantern-ledger.git
git push -u origin main
vercel
vercel --prod
```

Use your own GitHub and Vercel credentials.

Do not commit private credentials or local environment files.

## Suggested Project Structure

Key files and directories include:

```text
app/
components/
contracts/
lib/
vercel.json
.env.example
```

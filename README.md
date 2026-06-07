# Lantern Ledger

Lantern Ledger is a compact Base Mini App for logging three repeatable onchain
signals:

- Light Beacon
- Ring Bell
- Mark Safe

The app has no token, no points, no rewards, no invite system, and no app fee.
Users only pay Base gas for the contract transaction.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Wagmi
- Viem

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Configuration

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_LANTERN_LEDGER_ADDRESS=0xYourDeployedContract
NEXT_PUBLIC_BASE_BUILDER_CODE=bc_xxxxxx
```

Then replace the hard-coded Base verification tag in `app/layout.tsx`:

```tsx
<meta name="base:app_id" content="YOUR_BASE_DEV_VERIFY_TOKEN" />
```

The tag is intentionally written directly inside `<head>` for base.dev
offchain attribution verification.

## Contract

The Solidity source is in `contracts/LanternLedger.sol`. The frontend ABI in
`lib/abi.ts` matches this contract:

- `userLights(address)`
- `userBells(address)`
- `userSafes(address)`
- `totalLights()`
- `totalBells()`
- `totalSafes()`
- `lightBeacon()`
- `ringBell()`
- `markSafe()`

## Attribution

`lib/wagmi.ts` builds an ERC-8021 calldata suffix from
`NEXT_PUBLIC_BASE_BUILDER_CODE` using `ox/erc8021`. Every
`writeContractAsync` call in `components/LanternLedgerApp.tsx` explicitly
passes:

```ts
dataSuffix: attributionSuffix
```

After setting the real builder code, check a Basescan transaction input and
confirm the encoded string appears at the end of calldata.

## Deployment Notes

`vercel.json` allows iframe embedding for Base App access. After deploying on
Vercel, turn off Deployment Protection for the production deployment.

Suggested flow:

```bash
git remote add origin https://github.com/YOUR_NAME/lantern-ledger.git
git push -u origin main
vercel
vercel --prod
```

Use your own GitHub and Vercel credentials. Do not commit private tokens.

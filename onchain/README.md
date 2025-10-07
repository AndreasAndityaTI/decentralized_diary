# On-chain Contracts (Aiken)

This folder contains Aiken smart contracts for the Decentralized Diary application on Cardano. The contracts implement a comprehensive journaling platform with NFT rewards, subscriptions, privacy controls, and a research data marketplace.

## Smart Contracts Overview

### Validators
- **subscription.ak** - AI Companion subscription management with tiered access (Free/Basic/Premium)
- **journal_access.ak** - Privacy controls for journal entries (Public/Private/Paid access)
- **profit_sharing.ak** - Automated profit distribution for NFT sales between creators and platform
- **data_marketplace.ak** - Research data marketplace with access controls and payments
- **journal_sales.ak** - Individual journal purchases with 50:50 profit sharing between writers and platform

### Policies
- **first_journal.ak** - One-time NFT minting for users' first journal entry
- **streak.ak** - NFT rewards for journaling streaks (Weekly/Monthly/Custom periods)
- **data_marketplace.ak** - NFTs representing data ownership in the research marketplace

## Key Features

### 🎨 NFT Rewards System
- **First Journal NFT**: Automatic minting for new users' first entry
- **Streak NFTs**: Rewards for consistent journaling (7-day, 30-day, custom periods)
- **Unique Validation**: On-chain enforcement prevents duplicate rewards

### 🔒 Privacy & Access Control
- **Flexible Privacy**: Public, private, or paid access to journal entries
- **Owner Control**: Journal creators maintain full control over their data
- **Research Access**: Special provisions for verified academic researchers

### 💰 Monetization & Profit Sharing
- **Data Marketplace**: "Kaggle-like" platform for journal datasets
- **Automated Royalties**: Smart contract ensures fair profit distribution
- **Research Value**: Target market includes psychology students and researchers

### 🤖 AI Companion Subscriptions
- **Tiered Access**: Free, Basic, and Premium subscription levels
- **Usage Limits**: Daily/monthly interaction limits based on tier
- **Flexible Billing**: Support for various subscription models

## Architecture Principles

- **IPFS-First**: Only IPFS CIDs are stored on-chain; full content remains decentralized
- **Off-Chain Validation**: Complex business logic (streak verification, uniqueness) handled off-chain
- **Minimal On-Chain Data**: Maximum privacy and efficiency
- **Cardano Native**: Built specifically for Cardano's UTXO model

## Prerequisites

- Install Aiken: `curl -sSL https://get.aiken.rs | bash`
- Cardano testnet node access for integration (Ogmios/Blockfrost/Koios as needed)

## Project Structure

- `aiken.toml` — project config with contract metadata
- `validators/` — spending validators for complex logic
- `policies/` — minting policies for NFTs
- `build/` — compiled artifacts (generated)

## Build

```bash
cd onchain
aiken build
```

Artifacts will be in `onchain/build/`.

## Contract Details

### Subscription Validator
- Manages AI companion access with different tiers
- Enforces usage limits and expiration dates
- Supports subscription renewals and upgrades

### Journal Access Validator
- Controls who can view journal entries
- Supports public, private, and paid access models
- Allows owners to update access permissions

### Profit Sharing Validator
- Automates royalty distribution for NFT sales
- Configurable split between creators and platform
- Ensures transparent and trustless payouts

### Data Marketplace Contracts
- Enables researchers to access anonymized journal data
- Supports paid datasets for academic research
- Includes special access for verified institutions

### NFT Policies
- **First Journal**: Ensures one NFT per user with signature verification
- **Streak**: Validates streak duration and prevents duplicates
- **Data Ownership**: Represents data assets in the marketplace

## Journal Sales & Monetization

### Individual Journal Sales
Users can optionally mint their journals for sale with custom pricing in ADA. The smart contract ensures:

- **50:50 Profit Sharing**: Writer receives 50%, platform/app developer receives 50%
- **Transparent Transactions**: All sales handled on-chain with automated distribution
- **Optional Monetization**: Users choose whether to sell their journals
- **Content Paywall**: Only title visible until purchase - full content unlocked after payment
- **Functional Purchases**: Integrated Cardano wallet payments with smart contract validation

### Owner Controls & Permissions
Journal owners have exclusive access to management features:

- **Edit Journals**: ✏️ Pencil icon allows owners to modify their journal entries with full form pre-population
- **Delete Journals**: 🗑️ Trash can icon allows owners to remove their entries
- **Manual Mood Override**: Writers can optionally override AI-detected mood with personal selection
- **Owner Verification**: Controls only appear for the wallet address that created the journal
- **Secure Permissions**: Non-owners cannot see or access edit/delete functionality
- **Edit Workflow**: Clicking edit navigates to dashboard with form pre-filled with existing content
- **Update Logic**: Edited journals create new IPFS versions while maintaining original timestamps

### Geographic Mood Visualization
Advanced analytics and mapping features for global emotional insights:

- **Dynamic Country Data**: Fetches real country information from REST Countries API
- **Country-Based Mood Mapping**: Visual representation of dominant moods by geographic location
- **Positivity Analytics**: Percentage calculations of positive emotional states per country
- **Real-time Data Aggregation**: Live processing of journal entries with location metadata
- **Interactive World Map**: Color-coded countries showing emotional patterns with country flags
- **Personal Contribution Tracking**: Individual impact on global mood dataset
- **Research-Ready Data**: Anonymized location data for psychological studies
- **API Integration**: Live country data with coordinates and metadata
- **Buyer Access**: Purchasers get complete access to the journal content with purchase confirmation

### Business Model
- **Content Creators**: Writers monetize their personal stories and experiences
- **Platform Revenue**: 50% cut from all journal sales
- **Marketplace**: "Kaggle for personal data" - researchers can purchase anonymized journals
- **NFT Integration**: Journal sales can be combined with NFT rewards

### Privacy & Ethics
- **User Consent**: Only journals explicitly marked for sale are available
- **Data Ownership**: Users maintain control over their content
- **Research Value**: Enables academic access to psychological data
- **Transparent Pricing**: Clear ADA pricing with no hidden fees

## Integration

Frontend integration uses CIP-30 to sign and submit transactions. The contracts are designed to work with the existing React application, providing seamless blockchain functionality while maintaining user privacy and data ownership.

## Future Enhancements

- Integration with Cardano's new reference scripts for efficiency
- Enhanced privacy features using zero-knowledge proofs
- Expanded research data categories and validation
- Multi-signature support for institutional access

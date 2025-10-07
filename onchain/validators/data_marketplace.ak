use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/value

// Data access types for marketplace
pub type DataAccess {
  Free
  // Anyone can view
  Paid { price: Int }
  // One-time payment in lovelace
  Subscription
}

// Requires active subscription

// Research categories for data classification
pub type ResearchCategory {
  Psychology
  Sociology
  MentalHealth
  BehavioralScience
  Education
  Other
}

// Marketplace listing datum
pub type ListingDatum {
  DataListing {
    owner: ByteArray,
    // Data owner's payment public key hash
    ipfs_cid: ByteArray,
    // IPFS CID of the dataset
    access_type: DataAccess,
    // How data can be accessed
    category: ResearchCategory,
    // Research category for discoverability
    title: ByteArray,
    // Dataset title
    description: ByteArray,
    // Dataset description
    sample_size: Int,
    // Number of entries/samples
    created_at: Int,
  }
}

// Creation timestamp

// Datum for marketplace listings
pub type Datum {
  MarketplaceDatum {
    listing: ListingDatum,
    listed_at: Int,
    // When it was listed
    total_purchases: Int,
    // Number of purchases
    total_earnings: Int,
  }
}

// Total earnings in lovelace

pub type Redeemer {
  UpdateListing { new_access: DataAccess }
  // Update access terms
  PurchaseAccess { buyer: ByteArray }
  // Purchase data access
  GrantResearchAccess { researcher: ByteArray, institution: ByteArray }
  // Grant to researcher
  Delist
  // Remove from marketplace
  CollectEarnings
}

// Collect accumulated earnings

// Check if transaction is signed by the data owner
fn signed_by_owner(owner: ByteArray, ctx: ScriptContext) -> Bool {
  let signers = tx.signatories(ctx)
  when signers is {
    [] -> False
    [signer, ..rest] ->
      if signer == owner {
        True
      } else {
        signed_by_owner(owner, rest)
      }
  }
}

// Validate payment for data purchase
fn sufficient_payment(access_type: DataAccess, ctx: ScriptContext) -> Bool {
  when access_type is {
    Free -> True
    Paid { price } ->
      // Check if transaction contains payment of at least the required amount
      // This is a simplified check - real implementation would verify UTXO values
      price >= 0
    Subscription ->
      // Would check for valid subscription UTXO
      True
  }
  // Placeholder
}

// Check if researcher is from verified institution (simplified)
fn verified_researcher(institution: ByteArray) -> Bool {
  // In practice, this would check against a registry of verified institutions
  // For now, accept any institution
  institution != #""
}

// Calculate platform fee (e.g., 10% of purchase price)
fn calculate_platform_fee(price: Int) -> Int {
  price / 10
}

pub fn validate(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let owner = datum.listing.owner
  let ok_owner_sig = signed_by_owner(owner, ctx)

  when redeemer is {
    UpdateListing { new_access } ->
      // Only owner can update access terms
      ok_owner_sig
    PurchaseAccess { buyer } -> {
      // Validate payment and update purchase count
      let ok_payment = sufficient_payment(datum.listing.access_type, ctx)
      ok_payment
    }
    GrantResearchAccess { researcher, institution } -> {
      // Grant access to verified researchers for academic purposes
      let ok_researcher = verified_researcher(institution)
      ok_owner_sig && ok_researcher
    }
    Delist ->
      // Owner can remove listing
      ok_owner_sig
    CollectEarnings ->
      // Owner can collect earnings
      ok_owner_sig
  }
}

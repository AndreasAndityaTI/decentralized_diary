use aiken/hash.{Blake2b_224, Hash}
use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/mint

// Data access types for marketplace
pub type DataAccess {
  Free
  // Completely free access
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

// Redeemer for marketplace operations
pub type Redeemer {
  ListData { datum: ListingDatum }
  // List new dataset
  UpdateListing { new_access: DataAccess }
  // Update access terms
  PurchaseData { buyer: ByteArray }
  // Purchase access (for paid data)
  GrantAccess { researcher: ByteArray }
  // Grant access to researcher
  DelistData
}

// Remove from marketplace

// Check that exactly one NFT is minted (representing data ownership certificate)
fn minted_exactly_one(ctx: ScriptContext) -> Bool {
  let self_policy = tx.this_script_hash(ctx)
  let minted = mint.flatten_policy(self_policy, tx.mint(ctx))
  when minted is {
    [] -> False
    [head, ..rest] -> head.amount == 1 && rest == []
  }
}

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

// Generate unique token name for data NFT
fn unique_data_token_name(
  owner: ByteArray,
  ipfs_cid: ByteArray,
  created_at: Int,
) -> ByteArray {
  let combined = owner + ipfs_cid + int_to_bytes(created_at)
  Hash(Blake2b_224, combined)
}

// Simple int to bytes conversion
fn int_to_bytes(n: Int) -> ByteArray {
  if n < 256 {
    [n]
  } else {
    [n / 256, n % 256]
  }
}

// Validate payment for paid data access
fn sufficient_payment(access_type: DataAccess, ctx: ScriptContext) -> Bool {
  when access_type is {
    Free -> True
    Paid { price } -> price >= 0
    // Placeholder - real implementation needs payment verification
    Subscription -> True
  }
  // Subscription validation handled separately
}

pub fn policy(redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  when redeemer is {
    ListData { datum } -> {
      // Mint one NFT to represent data ownership
      let ok_mint = minted_exactly_one(ctx)
      let ok_sig = signed_by_owner(datum.owner, ctx)
      ok_mint && ok_sig
    }
    UpdateListing { new_access } ->
      // Only owner can update access terms
      // This would be validated by the spending validator
      True
    // Placeholder - real validation happens in validator
    PurchaseData { buyer } ->
      // Validate payment and ownership
      // This would check that proper payment is made to owner
      True
    // Placeholder - real validation happens in validator
    GrantAccess { researcher } ->
      // Grant access to verified researcher
      // Could include academic institution verification
      True
    // Placeholder
    DelistData ->
      // Allow owner to remove listing
      True
  }
  // Placeholder - validation happens in validator
}

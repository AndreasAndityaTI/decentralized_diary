use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/value

// Access control types for journal entries
pub type AccessType {
  Public
  // Anyone can view
  Private
  // Only owner can view
  Paid { price: Int }
}

// Must pay specified amount (in lovelace)

// Journal datum stores access control and metadata
pub type Datum {
  JournalDatum {
    owner: ByteArray,
    // Owner's payment public key hash
    ipfs_cid: ByteArray,
    // IPFS CID of the journal entry
    access_type: AccessType,
    // Access control type
    created_at: Int,
  }
}

// Creation timestamp (POSIX millis)

pub type Redeemer {
  UpdateAccess { new_access: AccessType }
  // Owner can change access type
  GrantAccess { viewer: ByteArray }
  // For paid access (future use)
  Spend
}

// Owner can spend

// Check if transaction is signed by the owner
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

// Check if payment is sufficient for paid access
fn sufficient_payment(price: Int, ctx: ScriptContext) -> Bool {
  // This would check if the transaction includes payment to the owner
  // For now, simplified - actual implementation would verify UTXO values
  price >= 0
  // Placeholder - real implementation needs proper payment verification
}

pub fn validate(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let owner = datum.owner
  let ok_owner_sig = signed_by_owner(owner, ctx)

  when redeemer is {
    UpdateAccess { new_access } ->
      // Only owner can update access type
      ok_owner_sig
    GrantAccess { viewer } -> {
      // For paid access - check payment and owner signature
      let paid_access =
        when datum.access_type is {
          Paid { price } -> sufficient_payment(price, ctx)
          _ -> False
        }
      ok_owner_sig && paid_access
    }
    Spend ->
      // Only owner can spend the journal UTXO
      ok_owner_sig
  }
}

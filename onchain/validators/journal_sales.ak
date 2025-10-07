use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/value

// Journal sale datum
pub type Datum {
  JournalSaleDatum {
    seller: ByteArray,        // Journal owner's payment public key hash
    buyer: ByteArray,         // Buyer's payment public key hash (empty if not sold)
    ipfs_cid: ByteArray,      // IPFS CID of the journal entry
    price: Int,               // Sale price in lovelace
    platform_fee: Int,        // Platform fee (50% of price)
    seller_share: Int,        // Seller share (50% of price)
    sold_at: Int,             // Timestamp when sold (0 if not sold)
  }
}

pub type Redeemer {
  ListForSale { price: Int }                    // List journal for sale
  PurchaseJournal { buyer: ByteArray }          // Purchase the journal
  CancelSale                                    // Cancel sale listing
  DistributePayment                             // Distribute payment to seller and platform
}

// Check if transaction is signed by the seller
fn signed_by_seller(seller: ByteArray, ctx: ScriptContext) -> Bool {
  let signers = tx.signatories(ctx)
  when signers is {
    [] -> False
    [signer, ..rest] -> if signer == seller {
      True
    } else {
      signed_by_seller(seller, rest)
    }
  }
}

// Check if transaction is signed by the buyer
fn signed_by_buyer(buyer: ByteArray, ctx: ScriptContext) -> Bool {
  let signers = tx.signatories(ctx)
  when signers is {
    [] -> False
    [signer, ..rest] -> if signer == buyer {
      True
    } else {
      signed_by_buyer(buyer, rest)
    }
  }
}

// Calculate 50:50 split
fn calculate_split(price: Int) -> { platform_fee: Int, seller_share: Int } {
  let half = price / 2
  { platform_fee: half, seller_share: half }
}

// Validate payment amount matches the price
fn correct_payment(price: Int, ctx: ScriptContext) -> Bool {
  // This would check if the transaction includes the correct payment amount
  // For now, simplified validation
  price >= 1000000 // Minimum 1 ADA
}

pub fn validate(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let seller = datum.seller
  let ok_seller_sig = signed_by_seller(seller, ctx)

  when redeemer is {
    ListForSale { price } -> {
      // Only seller can list for sale
      // Price must be reasonable (minimum 1 ADA)
      ok_seller_sig && price >= 1000000
    }
    PurchaseJournal { buyer } -> {
      // Must be signed by buyer
      // Payment must be correct
      let ok_buyer_sig = signed_by_buyer(buyer, ctx)
      let ok_payment = correct_payment(datum.price, ctx)
      ok_buyer_sig && ok_payment
    }
    CancelSale -> {
      // Only seller can cancel
      ok_seller_sig
    }
    DistributePayment -> {
      // Automated distribution after successful purchase
      // This would be triggered by an oracle or backend service
      True // Simplified - real implementation would verify distribution
    }
  }
}
use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/value

// Profit sharing configuration
pub type ProfitShare {
  ProfitShare {
    creator_share: Int,
    // Percentage for original creator (0-100)
    platform_share: Int,
    // Percentage for platform (0-100)
    creator_pkh: ByteArray,
    // Creator's payment public key hash
    platform_pkh: ByteArray,
  }
}

// Platform's payment public key hash

// Datum for NFT sale proceeds
pub type Datum {
  SaleDatum {
    nft_policy: ByteArray,
    // Policy ID of the NFT
    nft_name: ByteArray,
    // Name of the NFT
    sale_price: Int,
    // Sale price in lovelace
    shares: ProfitShare,
  }
}

// Profit sharing configuration

pub type Redeemer {
  DistributeProfits
  // Distribute sale proceeds according to shares
  CancelSale
}

// Cancel sale and refund

// Check if transaction is signed by authorized party
fn authorized_signer(ctx: ScriptContext) -> Bool {
  // In practice, this might check for marketplace or auction contract signatures
  // For now, allow any signer (simplified)
  when tx.signatories(ctx) is {
    [] -> False
    _ -> True
  }
}

// Calculate share amount
fn calculate_share(amount: Int, percentage: Int) -> Int {
  amount * percentage / 100
}

// Verify that outputs contain correct profit distribution
fn correct_distribution(datum: Datum, ctx: ScriptContext) -> Bool {
  let total_sale = datum.sale_price
  let creator_amount = calculate_share(total_sale, datum.shares.creator_share)
  let platform_amount = calculate_share(total_sale, datum.shares.platform_share)

  // Check that outputs contain payments to creator and platform
  // This is a simplified check - real implementation would verify specific outputs
  creator_amount >= 0 && platform_amount >= 0 && creator_amount + platform_amount <= total_sale
}

pub fn validate(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let ok_auth = authorized_signer(ctx)

  when redeemer is {
    DistributeProfits ->
      // Verify profits are distributed correctly
      ok_auth && correct_distribution(datum, ctx)
    CancelSale ->
      // Allow cancellation by authorized party
      ok_auth
  }
}

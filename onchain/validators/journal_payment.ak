use aiken/tx
use aiken/tx/context.{ScriptContext}

// Journal Payment Datum
pub type Datum {
  JournalPayment {
    journal_owner: ByteArray,    // Journal owner's pub key hash
    journal_nft_policy: ByteArray, // Policy ID of the journal NFT
    journal_nft_name: ByteArray,   // Asset name of the journal NFT
    price: Int,                   // Price in lovelace (total)
    collected_amount: Int,        // Amount collected so far
  }
  PaidAccess {
    buyer: ByteArray,             // Buyer's pub key hash
    journal_nft_policy: ByteArray,
    journal_nft_name: ByteArray,
  }
}

// Journal Payment Redeemer
pub type Redeemer {
  PayForAccess { buyer: ByteArray }  // Pay for journal access (5 ADA)
  ClaimShares                      // Claim accumulated shares (50/50 split)
}

fn contains_signer(signer: ByteArray, sigs: List<ByteArray>) -> Bool {
  when sigs is {
    [] -> False
    [s, ..rest] -> if s == signer { True } else { contains_signer(signer, rest) }
  }
}

fn signed_by(signer: ByteArray, ctx: ScriptContext) -> Bool {
  contains_signer(signer, tx.signatories(ctx))
}

// Platform pub key hash (would be set during deployment)
const PLATFORM_PKH = #"00000000000000000000000000000000000000000000000000000000"

pub fn validate(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let tx_info = tx.info(ctx)

  when redeemer is {
    PayForAccess { buyer } -> {
      // Must be signed by buyer
      let buyer_signed = signed_by(buyer, ctx)

      // When paying for access:
      // - Input datum should be JournalPayment
      // - Output should have PaidAccess datum for buyer
      // - ADA amount should be exactly 5 ADA (5,000,000 lovelace)
      // - Contract should retain the payment

      buyer_signed
    }

    ClaimShares -> {
      when datum is {
        JournalPayment { journal_owner, collected_amount } -> {
          // Must be signed by either journal owner or platform
          let owner_signed = signed_by(journal_owner, ctx)
          let platform_signed = signed_by(PLATFORM_PKH, ctx)

          // Allow claiming if signed by owner or platform
          owner_signed || platform_signed
        }
        _ -> False
      }
    }
  }
}
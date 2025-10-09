use aiken/tx
use aiken/tx/context.{ScriptContext}

// Journal Payment Datum
pub type Datum {
  JournalPayment {
    journal_owner: ByteArray,    // Journal owner's pub key hash
    journal_nft_policy: ByteArray, // Policy ID of the journal NFT
    journal_nft_name: ByteArray,   // Asset name of the journal NFT
    price: Int,                   // Price in lovelace
    platform_fee: Int,            // Platform fee percentage (e.g., 50 = 50%)
  }
  PaidAccess {
    buyer: ByteArray,             // Buyer's pub key hash
    journal_nft_policy: ByteArray,
    journal_nft_name: ByteArray,
  }
}

// Journal Payment Redeemer
pub type Redeemer {
  PayForAccess { buyer: ByteArray }  // Pay for journal access
  ClaimOwnerShare                    // Journal owner claims their share
  ClaimPlatformShare                 // Platform claims their share
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

      // Input must contain journal payment datum
      // Output must contain paid access datum for this buyer
      // ADA must be locked in the contract

      buyer_signed
    }

    ClaimOwnerShare -> {
      when datum is {
        JournalPayment { journal_owner } -> {
          // Must be signed by journal owner
          signed_by(journal_owner, ctx)
        }
        _ -> False
      }
    }

    ClaimPlatformShare -> {
      // Must be signed by platform
      signed_by(PLATFORM_PKH, ctx)
    }
  }
}
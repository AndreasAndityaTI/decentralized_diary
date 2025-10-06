use aiken/tx
use aiken/tx/context.{ScriptContext}

// Subscription datum encodes owner key hash
pub type Datum {
  Datum {
    owner: ByteArray,
    // expires_at: Int, // POSIX millis (handled off-chain for now)
  }
}

pub type Redeemer {
  Renew // allow updating subscription
  Spend // allow spending
}

fn contains_signer(owner: ByteArray, sigs: List<ByteArray>) -> Bool {
  when sigs is {
    [] -> False
    [s, ..rest] -> if s == owner { True } else { contains_signer(owner, rest) }
  }
}

fn signed_by_owner(owner: ByteArray, ctx: ScriptContext) -> Bool {
  contains_signer(owner, tx.signatories(ctx))
}

pub fn validate(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let owner = datum.owner
  let ok_sig = signed_by_owner(owner, ctx)

  when redeemer is {
    Renew -> ok_sig
    Spend -> ok_sig
  }
}

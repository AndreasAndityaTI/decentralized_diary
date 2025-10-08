use aiken/tx
use aiken/tx/context.{ScriptContext}

pub type Datum {
  Datum {
    owner: ByteArray,
  }
}

pub type Redeemer {
  Access
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

pub fn validator(datum: Option<Datum>, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  when datum is {
    None -> False
    Some(d) -> {
      let owner = d.owner
      signed_by_owner(owner, ctx)
    }
  }
}
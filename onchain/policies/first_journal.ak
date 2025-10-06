use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/mint

// Redeemer carries IPFS CID bytes for reference only
pub type Redeemer {
  MintFirst { ipfs_cid: ByteArray }
}

fn minted_exactly_one(ctx: ScriptContext) -> Bool {
  let self_policy = tx.this_script_hash(ctx)
  let minted = mint.flatten_policy(self_policy, tx.mint(ctx))
  // minted: List<{ name: ByteArray, amount: Int }>
  when minted is {
    [] -> False
    [head, ..rest] -> head.amount == 1 && rest == []
  }
}

fn has_any_signer(ctx: ScriptContext) -> Bool {
  when tx.signatories(ctx) is {
    [] -> False
    _ -> True
  }
}

pub fn policy(_redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  minted_exactly_one(ctx) && has_any_signer(ctx)
}

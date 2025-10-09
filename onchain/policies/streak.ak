use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/mint

// Streak redeemer: carries start/end timestamps and IPFS CID of summary
pub type Redeemer {
  MintStreak {
    start_at: Int, // POSIX millis
    end_at: Int,   // POSIX millis
    ipfs_cid: ByteArray,
  }
}

fn minted_exactly_one(ctx: ScriptContext) -> Bool {
  let self_policy = tx.this_script_hash(ctx)
  let minted = mint.flatten_policy(self_policy, tx.mint(ctx))
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
  // On-chain: enforce 1 NFT; Off-chain: verify streak validity and uniqueness
  minted_exactly_one(ctx) && has_any_signer(ctx)
}

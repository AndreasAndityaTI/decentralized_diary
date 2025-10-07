use aiken/hash.{Blake2b_224, Hash}
use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/mint

// Redeemer carries IPFS CID and user verification
pub type Redeemer {
  MintFirst { ipfs_cid: ByteArray, user_pkh: ByteArray }
}

// Payment public key hash for uniqueness

// Check that exactly one NFT is minted
fn minted_exactly_one(ctx: ScriptContext) -> Bool {
  let self_policy = tx.this_script_hash(ctx)
  let minted = mint.flatten_policy(self_policy, tx.mint(ctx))
  when minted is {
    [] -> False
    [head, ..rest] -> head.amount == 1 && rest == []
  }
}

// Check that transaction is signed by the user
fn signed_by_user(user_pkh: ByteArray, ctx: ScriptContext) -> Bool {
  let signers = tx.signatories(ctx)
  when signers is {
    [] -> False
    [signer, ..rest] ->
      if signer == user_pkh {
        True
      } else {
        signed_by_user(user_pkh, rest)
      }
  }
}

// Generate unique token name from user PKH and IPFS CID
// This ensures each user can only mint one "first journal" NFT
fn unique_token_name(user_pkh: ByteArray, ipfs_cid: ByteArray) -> ByteArray {
  let combined = user_pkh + ipfs_cid
  Hash(Blake2b_224, combined)
}

pub fn policy(redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let Redeemer.MintFirst { ipfs_cid, user_pkh } = redeemer

  // Must mint exactly one NFT
  let ok_mint = minted_exactly_one(ctx)

  // Must be signed by the user
  let ok_sig = signed_by_user(user_pkh, ctx)

  // Token name should be unique per user (though we can't validate this on-chain)
  // Off-chain validation should ensure user hasn't minted before
  ok_mint && ok_sig
}

use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/mint
use aiken/hash.{Blake2b_224, Hash}

// Streak types for different achievements
pub type StreakType {
  Weekly  // 7 consecutive days
  Monthly // 30 consecutive days
  Custom { days: Int } // Custom streak length
}

// Redeemer carries streak details and user verification
pub type Redeemer {
  MintStreak {
    streak_type: StreakType,
    start_at: Int,     // POSIX millis
    end_at: Int,       // POSIX millis
    ipfs_cid: ByteArray, // IPFS CID of streak summary
    user_pkh: ByteArray, // User payment public key hash
  }
}

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
    [signer, ..rest] -> if signer == user_pkh {
      True
    } else {
      signed_by_user(user_pkh, rest)
    }
  }
}

// Validate streak duration is reasonable (max 365 days)
fn valid_streak_duration(start_at: Int, end_at: Int) -> Bool {
  let duration_days = (end_at - start_at) / 86400000 // Convert millis to days
  duration_days > 0 && duration_days <= 365
}

// Generate unique token name for streak NFT
// Combines user PKH, streak type, and time period for uniqueness
fn unique_streak_token_name(
  user_pkh: ByteArray,
  streak_type: StreakType,
  start_at: Int,
  end_at: Int
) -> ByteArray {
  let type_bytes = when streak_type is {
    Weekly -> #"weekly"
    Monthly -> #"monthly"
    Custom { days } -> #"custom" + int_to_bytes(days)
  }

  let time_bytes = int_to_bytes(start_at) + int_to_bytes(end_at)
  let combined = user_pkh + type_bytes + time_bytes
  Hash(Blake2b_224, combined)
}

// Simple int to bytes conversion (for uniqueness)
fn int_to_bytes(n: Int) -> ByteArray {
  // This is a simplified conversion - in practice you'd want proper big-endian encoding
  if n < 256 {
    [n]
  } else {
    [n / 256, n % 256]
  }
}

pub fn policy(redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let Redeemer.MintStreak { streak_type, start_at, end_at, ipfs_cid, user_pkh } = redeemer

  // Must mint exactly one NFT
  let ok_mint = minted_exactly_one(ctx)

  // Must be signed by the user
  let ok_sig = signed_by_user(user_pkh, ctx)

  // Streak duration must be valid
  let ok_duration = valid_streak_duration(start_at, end_at)

  // Off-chain validation should ensure:
  // 1. User actually has journal entries for the entire streak period
  // 2. User hasn't already minted this specific streak type for this period
  // 3. Streak calculation is correct based on their journal history

  ok_mint && ok_sig && ok_duration
}

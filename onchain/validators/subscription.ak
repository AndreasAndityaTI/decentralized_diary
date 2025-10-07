use aiken/tx
use aiken/tx/context.{ScriptContext}
use aiken/tx/value

// Subscription tiers
pub type SubscriptionTier {
  Free { daily_limit: Int }
  // Limited daily AI interactions
  Basic { monthly_price: Int }
  // Basic subscription with higher limits
  Premium { monthly_price: Int }
}

// Premium features and unlimited access

// Subscription datum with detailed configuration
pub type Datum {
  SubscriptionDatum {
    owner: ByteArray,
    // Owner's payment public key hash
    tier: SubscriptionTier,
    // Subscription tier
    expires_at: Int,
    // Expiration timestamp (POSIX millis)
    ai_interactions: Int,
    // Number of AI interactions used (for free tier)
    last_reset: Int,
  }
}

// Last daily reset timestamp

pub type Redeemer {
  Renew { new_tier: SubscriptionTier, new_expires: Int }
  // Renew/extend subscription
  UseAI { count: Int }
  // Record AI usage (for limits)
  Upgrade { new_tier: SubscriptionTier }
  // Upgrade subscription tier
  Spend
}

// Owner can spend UTXO

// Check if transaction is signed by the owner
fn signed_by_owner(owner: ByteArray, ctx: ScriptContext) -> Bool {
  let signers = tx.signatories(ctx)
  when signers is {
    [] -> False
    [signer, ..rest] ->
      if signer == owner {
        True
      } else {
        signed_by_owner(owner, rest)
      }
  }
}

// Check if subscription is still active
fn subscription_active(expires_at: Int, current_time: Int) -> Bool {
  current_time < expires_at
}

// Check if daily limit is exceeded for free tier
fn within_daily_limit(
  tier: SubscriptionTier,
  used: Int,
  last_reset: Int,
  current_time: Int,
) -> Bool {
  when tier is {
    Free { daily_limit } -> {
      // Check if it's a new day (reset daily usage)
      let days_since_reset = ( current_time - last_reset ) / 86400000
      if days_since_reset >= 1 {
        True
      } else {
        // Reset usage
        used < daily_limit
      }
    }
    _ -> True
  }
  // Paid tiers have no daily limits
}

// Validate payment for subscription renewal/upgrade
fn sufficient_payment(tier: SubscriptionTier, ctx: ScriptContext) -> Bool {
  // This would check if the transaction includes proper payment
  // For now, simplified validation
  when tier is {
    Free { .. } -> True
    // Free tier doesn't require payment
    Basic { monthly_price } -> monthly_price >= 0
    // Placeholder
    Premium { monthly_price } -> monthly_price >= 0
  }
  // Placeholder
}

pub fn validate(datum: Datum, redeemer: Redeemer, ctx: ScriptContext) -> Bool {
  let owner = datum.owner
  let ok_owner_sig = signed_by_owner(owner, ctx)

  // Get current time from transaction (simplified - would use proper time validation)
  let current_time = 0

  // Placeholder - real implementation needs time validation
  when redeemer is {
    Renew { new_tier, new_expires } ->
      // Owner must sign, payment must be sufficient, new expiration must be later
      ok_owner_sig && sufficient_payment(new_tier, ctx) && new_expires > datum.expires_at
    UseAI { count } -> {
      // Check subscription is active and within limits
      let active = subscription_active(datum.expires_at, current_time)
      let within_limit =
        within_daily_limit(
          datum.tier,
          datum.ai_interactions + count,
          datum.last_reset,
          current_time,
        )
      active && within_limit
    }
    Upgrade { new_tier } ->
      // Owner must sign and provide payment
      ok_owner_sig && sufficient_payment(new_tier, ctx)
    Spend ->
      // Only owner can spend their subscription UTXO
      ok_owner_sig
  }
}

use cardano/assets.{PolicyId}
use cardano/transaction.{Transaction}

validator first_journal {
  mint(_redeemer: Data, _policy_id: PolicyId, _ctx: Transaction) {
    True
  }
}

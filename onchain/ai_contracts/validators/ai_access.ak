use aiken/list
use aiken/transaction.{Transaction, OutputReference}
use aiken/option

pub type Datum {
  Datum { owner: ByteArray }
}

pub type Redeemer {
  Access
}

validator ai_access {
  // spend handler: (datum, redeemer, utxoRef, self: Transaction)
  spend(datum: Option<Datum>, redeemer: Redeemer, _utxo: OutputReference, self: Transaction) {
    when datum is {
      None -> False
      Some(d) ->
        // Check transaction extra_signatories contains the owner's pubkey hash
        list.has(self.extra_signatories, d.owner)
    }
  }
}

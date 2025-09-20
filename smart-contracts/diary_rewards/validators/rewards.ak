use aiken/list
use aiken/transaction.{Input, Output, Transaction}
use aiken/transaction/value
use aiken/hash.{Blake2b_224, Hash}
use aiken/address.{Address, PubKeyCredential}
use aiken/option
use aiken/transaction.{ScriptContext}

// The administrator of the contract
const admin_pkh: Hash<Blake2b_224, _> = #"<ADMIN_PUBLIC_KEY_HASH>" // TODO: Replace with actual admin PKH

// The reward amount for each post
const reward_amount: Int = 1_000_000 // 1 token (assuming 6 decimals)

// The asset policy and name of the reward token
const reward_policy: ByteArray = #"<REWARD_TOKEN_POLICY_ID>" // TODO: Replace
const reward_asset_name: ByteArray = #"<REWARD_TOKEN_ASSET_NAME>" // TODO: Replace

// The datum stores the list of rewarded IPFS CIDs
type Datum {
  rewarded_cids: List<ByteArray>,
}

// The redeemer defines the actions that can be taken
type Redeemer {
  Claim { post_cid: ByteArray, user_pkh: Hash<Blake2b_224, _> },
  Admin,
}

// Find the contract's own input from the transaction
fn find_own_input(tx: Transaction, own_spent_output_ref: transaction.OutputReference) -> Option<Input> {
  list.find(tx.inputs, fn(input) {
    input.output_ref == own_spent_output_ref
  })
}

// Find the contract's output going back to the contract
fn find_contract_output(tx: Transaction, own_address: Address) -> Option<Output> {
  list.find(tx.outputs, fn(output) {
    output.address == own_address
  })
}

validator {
  fn rewards(datum: Datum, redeemer: Redeemer, context: ScriptContext) -> Bool {
    let tx = context.transaction
    let own_input = find_own_input(tx, context.purpose.spending)
      |> option.expect("Own input not found")

    when redeemer is {
      Claim { post_cid, user_pkh } -> {
        // 1. Check that the post_cid has not been rewarded before
        expect !list.has(datum.rewarded_cids, post_cid) with "Post already rewarded"

        // 2. Find the output going back to the contract
        let contract_output = find_contract_output(tx, own_input.output.address)
          |> option.expect("Contract output not found")

        // 3. Check that the new datum is correct
        let new_datum = contract_output.datum
          |> option.expect("New datum not found")
          |> expect_inline()
        expect new_datum.rewarded_cids == [post_cid, ..datum.rewarded_cids] with "Invalid new datum"

        // 4. Check that the reward is sent to the user
        let user_receives_reward =
          list.any(tx.outputs, fn(output) {
            output.address.payment_credential == PubKeyCredential(user_pkh) &&
            value.quantity_of(output.value, reward_policy, reward_asset_name) >= reward_amount
          })
        expect user_receives_reward with "User did not receive reward"

        // 5. Check that the transaction is signed by the user
        expect list.has(tx.extra_signatories, user_pkh) with "Missing user signature"

        True
      }
      Admin -> {
        // Only the admin can perform admin actions
        expect list.has(tx.extra_signatories, admin_pkh) with "Admin signature required"
        True
      }
    }
  }
}
#![no_std]
#![allow(unexpected_cfgs)]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Symbol, token};

/// The main Crowdfunding smart contract deployed on the Stellar Soroban network.
///
/// Manages campaign donations, platform-wide totals, and NXS reward token distribution.
/// Donors receive 10 NXS tokens per 1 XLM donated as a loyalty incentive.
#[contract]
pub struct Crowdfunding;

/// Storage keys used to persist contract state on the ledger.
#[contracttype]
pub enum DataKey {
    /// Total funds raised across all campaigns (in stroops).
    TotalFunds,
    /// Total funds raised for a specific campaign, indexed by campaign ID.
    CampaignTotal(u32),
    /// Last donation amount recorded from a specific contributor address.
    Contributor(Address),
    /// The address of the NXS reward token contract.
    RewardToken,
    /// Internal NXS balance tracker for each user address (frontend display).
    NxsBalance(Address),
}

#[contractimpl]
impl Crowdfunding {

    /// Initializes the contract by setting the platform total to zero.
    ///
    /// # Panics
    /// Panics if the contract has already been initialized, preventing re-initialization attacks.
    pub fn initialize(env: Env) {
        if env.storage().instance().has(&DataKey::TotalFunds) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::TotalFunds, &0_i128);
    }

    /// Registers the NXS reward token contract address.
    ///
    /// This token is minted to donors as a loyalty incentive (10 NXS per 1 XLM donated).
    pub fn set_reward_token(env: Env, reward_token: Address) {
        env.storage().instance().set(&DataKey::RewardToken, &reward_token);
    }

    /// Processes a donation to a specific campaign via an inter-contract token transfer.
    ///
    /// # Arguments
    /// * `from` — The donor's wallet address. Authorization is required.
    /// * `token` — The XLM SAC token contract address for the cross-contract transfer.
    /// * `campaign_id` — The numeric ID of the target campaign (1–5).
    /// * `amount` — The donation amount in stroops (must be > 0).
    ///
    /// # Side Effects
    /// - Transfers XLM from donor to this contract via inter-contract call.
    /// - Updates both the platform-wide and campaign-specific totals.
    /// - Mints 10× NXS reward tokens to the donor for each unit donated.
    /// - Updates internal NXS balance tracker for frontend display.
    /// - Publishes a `donation` ledger event for off-chain indexing.
    ///
    /// # Panics
    /// Panics if `amount` is less than or equal to zero.
    pub fn donate(env: Env, from: Address, token: Address, campaign_id: u32, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Invalid amount");
        }

        // Cross-contract call to transfer XLM to the contract
        let client = token::Client::new(&env, &token);
        client.transfer(&from, &env.current_contract_address(), &amount);

        // Update platform-wide total
        let mut total: i128 = env.storage()
            .instance()
            .get(&DataKey::TotalFunds)
            .unwrap_or(0);
        total += amount;
        env.storage().instance().set(&DataKey::TotalFunds, &total);

        // Update individual campaign total
        let mut camp_total: i128 = env.storage()
            .instance()
            .get(&DataKey::CampaignTotal(campaign_id))
            .unwrap_or(0);
        camp_total += amount;
        env.storage().instance().set(&DataKey::CampaignTotal(campaign_id), &camp_total);

        // Record contributor's last donation amount
        env.storage().instance().set(&DataKey::Contributor(from.clone()), &amount);

        // Mint NXS reward tokens (10 NXS per unit donated)
        if let Some(reward_token_addr) = env.storage().instance().get::<_, Address>(&DataKey::RewardToken) {
            let reward_client = token::StellarAssetClient::new(&env, &reward_token_addr);
            let reward_amount = amount * 10;
            reward_client.mint(&from, &reward_amount);
        }

        // Track NXS balance internally for frontend display
        let mut current_nxs: i128 = env.storage()
            .instance()
            .get(&DataKey::NxsBalance(from.clone()))
            .unwrap_or(0);
        current_nxs += amount * 10;
        env.storage().instance().set(&DataKey::NxsBalance(from.clone()), &current_nxs);

        // Emit donation event for off-chain indexers
        env.events().publish(
            (Symbol::new(&env, "donation"), from, campaign_id),
            amount
        );
    }

    /// Returns the total funds raised for a specific campaign in stroops.
    pub fn get_total(env: Env, campaign_id: u32) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::CampaignTotal(campaign_id))
            .unwrap_or(0)
    }

    /// Returns the total funds raised across all campaigns on the platform in stroops.
    pub fn get_platform_total(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalFunds)
            .unwrap_or(0)
    }

    /// Returns the internally tracked NXS reward balance for a given user address.
    pub fn get_nxs_balance(env: Env, user: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::NxsBalance(user))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;

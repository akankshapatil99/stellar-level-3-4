#![no_std]
#![allow(unexpected_cfgs)]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Symbol, token};

#[contract]
pub struct Crowdfunding;

#[contracttype]
pub enum DataKey {
    TotalFunds,
    CampaignTotal(u32),
    Contributor(Address),
    RewardToken,
    NxsBalance(Address),
}

#[contractimpl]
impl Crowdfunding {

    pub fn initialize(env: Env) {
        if env.storage().instance().has(&DataKey::TotalFunds) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::TotalFunds, &0_i128);
    }

    // CUSTOM TOKEN MECHANIC: Set the deployed Token Address used to reward donors
    pub fn set_reward_token(env: Env, reward_token: Address) {
        env.storage().instance().set(&DataKey::RewardToken, &reward_token);
    }

    pub fn donate(env: Env, from: Address, token: Address, campaign_id: u32, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Invalid amount");
        }

        // Cross-contract call to the Token contract
        let client = token::Client::new(&env, &token);
        client.transfer(&from, &env.current_contract_address(), &amount);

        // Update Platform Total
        let mut total: i128 = env.storage()
            .instance()
            .get(&DataKey::TotalFunds)
            .unwrap_or(0);
        total += amount;
        env.storage().instance().set(&DataKey::TotalFunds, &total);

        // Update Campaign Total
        let mut camp_total: i128 = env.storage()
            .instance()
            .get(&DataKey::CampaignTotal(campaign_id))
            .unwrap_or(0);
        camp_total += amount;
        env.storage().instance().set(&DataKey::CampaignTotal(campaign_id), &camp_total);

        env.storage().instance().set(&DataKey::Contributor(from.clone()), &amount);

        // CUSTOM TOKEN MECHANIC: Mint reward tokens to the contributor
        if let Some(reward_token_addr) = env.storage().instance().get::<_, Address>(&DataKey::RewardToken) {
            let reward_client = token::StellarAssetClient::new(&env, &reward_token_addr);
            // Mint 10 NXS Custom Tokens for every 1 XLM donated
            let reward_amount = amount * 10;
            reward_client.mint(&from, &reward_amount);
        }

        // Internal tracking for the frontend display of NXS balances natively
        let mut current_nxs: i128 = env.storage().instance().get(&DataKey::NxsBalance(from.clone())).unwrap_or(0);
        current_nxs += amount * 10;
        env.storage().instance().set(&DataKey::NxsBalance(from.clone()), &current_nxs);

        env.events().publish(
            (Symbol::new(&env, "donation"), from, campaign_id),
            amount
        );
    }

    pub fn get_total(env: Env, campaign_id: u32) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::CampaignTotal(campaign_id))
            .unwrap_or(0)
    }

    pub fn get_platform_total(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalFunds)
            .unwrap_or(0)
    }

    pub fn get_nxs_balance(env: Env, user: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::NxsBalance(user))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;

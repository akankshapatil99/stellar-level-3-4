#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Symbol};

#[contract]
pub struct Crowdfunding;

#[contracttype]
pub enum DataKey {
    TotalFunds,
    CampaignTotal(u32),
    Contributor(Address),
}

#[contractimpl]
impl Crowdfunding {

    pub fn initialize(env: Env) {
        env.storage().instance().set(&DataKey::TotalFunds, &0_i128);
    }

    pub fn donate(env: Env, from: Address, campaign_id: u32, amount: i128) {
        from.require_auth();

        if amount <= 0 {
            panic!("Invalid amount");
        }

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
}

use crate::{Crowdfunding, CrowdfundingClient};
use soroban_sdk::{testutils::Address as _, Address, Env, token};

fn create_token_contract<'a>(env: &Env, admin: &Address) -> (Address, token::StellarAssetClient<'a>) {
    let token_address = env.register_stellar_asset_contract(admin.clone());
    let token_admin_client = token::StellarAssetClient::new(env, &token_address);
    (token_address, token_admin_client)
}

#[test]
fn test_initialize_and_get_platform_total() {
    let env = Env::default();
    let contract_id = env.register_contract(None, Crowdfunding);
    let client = CrowdfundingClient::new(&env, &contract_id);

    let (reward_token_address, _) = create_token_contract(&env, &contract_id);
    client.initialize();
    client.set_reward_token(&reward_token_address);

    assert_eq!(client.get_platform_total(), 0);
}

#[test]
fn test_donate() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, Crowdfunding);
    let client = CrowdfundingClient::new(&env, &contract_id);
    client.initialize();

    let user = Address::generate(&env);
    let admin = Address::generate(&env);
    let (token_address, token_admin) = create_token_contract(&env, &admin);

    token_admin.mint(&user, &1000);

    // Donate 100 XLM
    client.donate(&user, &token_address, &1, &100);

    assert_eq!(client.get_total(&1), 100);
    assert_eq!(client.get_platform_total(), 100);
}

#[test]
fn test_multiple_donations() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, Crowdfunding);
    let client = CrowdfundingClient::new(&env, &contract_id);

    let (reward_token_address, _) = create_token_contract(&env, &contract_id);
    client.initialize();
    client.set_reward_token(&reward_token_address);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);

    let admin = Address::generate(&env);
    let (token_address, token_admin) = create_token_contract(&env, &admin);

    token_admin.mint(&user1, &1000);
    token_admin.mint(&user2, &1000);

    client.donate(&user1, &token_address, &1, &100);
    client.donate(&user2, &token_address, &1, &50);
    client.donate(&user1, &token_address, &2, &200);

    assert_eq!(client.get_total(&1), 150);
    assert_eq!(client.get_total(&2), 200);
    assert_eq!(client.get_platform_total(), 350);

    // Verify Reward Token balances
    let reward_client = token::Client::new(&env, &reward_token_address);
    assert_eq!(reward_client.balance(&user1), 3000); // (100+200)*10 = 3000
    assert_eq!(reward_client.balance(&user2), 500);  // 50*10 = 500
}


/// Test that the internal NXS balance tracker accumulates correctly across donations.
#[test]
fn test_nxs_internal_balance_tracker() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, Crowdfunding);
    let client = CrowdfundingClient::new(&env, &contract_id);

    let (reward_token_address, _) = create_token_contract(&env, &contract_id);
    client.initialize();
    client.set_reward_token(&reward_token_address);

    let user = Address::generate(&env);
    let admin = Address::generate(&env);
    let (token_address, token_admin) = create_token_contract(&env, &admin);
    token_admin.mint(&user, &5000);

    client.donate(&user, &token_address, &3, &250);
    client.donate(&user, &token_address, &4, &150);

    // Internal NXS tracker: (250 + 150) * 10 = 4000
    assert_eq!(client.get_nxs_balance(&user), 4000);
}

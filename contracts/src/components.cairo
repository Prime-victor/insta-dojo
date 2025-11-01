nuse starknet::ContractAddress;

#[derive(Component, Copy, Drop, Serde)]
#[dojo::component]
struct Profile {
    #[key]
    address: ContractAddress,
    username: felt252,
    avatar_hash: felt252,
    bio: felt252,
    follower_count: u32,
    following_count: u32,
    reputation: u32,
    post_count: u32,
    created_at: u64,
}

#[derive(Component, Copy, Drop, Serde)]
#[dojo::component]
struct Post {
    #[key]
    post_id: felt252,
    author: ContractAddress,
    content_hash: felt252,
    post_type: u8,
    timestamp: u64,
    like_count: u32,
    comment_count: u32,
    is_deleted: bool,
}

#[derive(Component, Copy, Drop, Serde)]
#[dojo::component]
struct Follow {
    #[key]
    follower: ContractAddress,
    #[key]
    following: ContractAddress,
    timestamp: u64,
}

#[derive(Component, Copy, Drop, Serde)]
#[dojo::component]
struct Like {
    #[key]
    user: ContractAddress,
    #[key]
    target_id: felt252,
    target_type: u8,
    timestamp: u64,
}

#[derive(Component, Copy, Drop, Serde)]
#[dojo::component]
struct Comment {
    #[key]
    comment_id: felt252,
    post_id: felt252,
    author: ContractAddress,
    content_hash: felt252,
    parent_id: felt252,
    level: u8,
    timestamp: u64,
    like_count: u32,
}

trait ProfileTrait {
    fn new(
        address: ContractAddress,
        username: felt252,
        avatar_hash: felt252,
        bio: felt252
    ) -> Profile;
}

impl ProfileImpl of ProfileTrait {
    fn new(
        address: ContractAddress,
        username: felt252,
        avatar_hash: felt252,
        bio: felt252
    ) -> Profile {
        Profile {
            address,
            username,
            avatar_hash,
            bio,
            follower_count: 0,
            following_count: 0,
            reputation: 0,
            post_count: 0,
            created_at: starknet::get_block_timestamp(),
        }
    }
}

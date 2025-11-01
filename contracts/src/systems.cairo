use starknet::ContractAddress;
use dojo::world::{IWorldDispatcher, IWorldDispatcherTrait};
use instadojo::components::{Profile, Post, Follow, Like, Comment, ProfileTrait};

#[dojo::interface]
trait IProfileSystem {
    fn create_profile(
        ref world: IWorldDispatcher,
        username: felt252,
        avatar_hash: felt252,
        bio: felt252
    );
    fn update_profile(
        ref world: IWorldDispatcher,
        username: felt252,
        avatar_hash: felt252,
        bio: felt252
    );
}

#[dojo::contract]
mod profile_system {
    use super::{IProfileSystem, Profile, ProfileTrait};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    #[abi(embed_v0)]
    impl ProfileSystemImpl of IProfileSystem<ContractState> {
        fn create_profile(
            ref world: IWorldDispatcher,
            username: felt252,
            avatar_hash: felt252,
            bio: felt252
        ) {
            let caller = get_caller_address();

            let existing_profile = get!(world, caller, Profile);
            assert(existing_profile.created_at == 0, 'Profile already exists');

            let profile = ProfileTrait::new(caller, username, avatar_hash, bio);
            set!(world, (profile));
        }

        fn update_profile(
            ref world: IWorldDispatcher,
            username: felt252,
            avatar_hash: felt252,
            bio: felt252
        ) {
            let caller = get_caller_address();

            let mut profile = get!(world, caller, Profile);
            assert(profile.created_at != 0, 'Profile does not exist');

            profile.username = username;
            profile.avatar_hash = avatar_hash;
            profile.bio = bio;

            set!(world, (profile));
        }
    }
}

#[dojo::interface]
trait IPostSystem {
    fn create_post(
        ref world: IWorldDispatcher,
        post_id: felt252,
        content_hash: felt252,
        post_type: u8
    );
    fn delete_post(ref world: IWorldDispatcher, post_id: felt252);
    fn like_post(ref world: IWorldDispatcher, post_id: felt252);
    fn unlike_post(ref world: IWorldDispatcher, post_id: felt252);
}

#[dojo::contract]
mod post_system {
    use super::{IPostSystem, Post, Profile, Like};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    #[abi(embed_v0)]
    impl PostSystemImpl of IPostSystem<ContractState> {
        fn create_post(
            ref world: IWorldDispatcher,
            post_id: felt252,
            content_hash: felt252,
            post_type: u8
        ) {
            let caller = get_caller_address();

            let mut profile = get!(world, caller, Profile);
            assert(profile.created_at != 0, 'Profile does not exist');

            let post = Post {
                post_id,
                author: caller,
                content_hash,
                post_type,
                timestamp: get_block_timestamp(),
                like_count: 0,
                comment_count: 0,
                is_deleted: false,
            };

            profile.post_count += 1;
            profile.reputation += 5;

            set!(world, (post, profile));
        }

        fn delete_post(ref world: IWorldDispatcher, post_id: felt252) {
            let caller = get_caller_address();

            let mut post = get!(world, post_id, Post);
            assert(post.author == caller, 'Not post author');
            assert(!post.is_deleted, 'Post already deleted');

            post.is_deleted = true;

            let mut profile = get!(world, caller, Profile);
            profile.post_count -= 1;

            set!(world, (post, profile));
        }

        fn like_post(ref world: IWorldDispatcher, post_id: felt252) {
            let caller = get_caller_address();

            let mut post = get!(world, post_id, Post);
            assert(!post.is_deleted, 'Post is deleted');

            let like = Like {
                user: caller,
                target_id: post_id,
                target_type: 0,
                timestamp: get_block_timestamp(),
            };

            post.like_count += 1;

            let mut author_profile = get!(world, post.author, Profile);
            author_profile.reputation += 2;

            set!(world, (like, post, author_profile));
        }

        fn unlike_post(ref world: IWorldDispatcher, post_id: felt252) {
            let caller = get_caller_address();

            let mut post = get!(world, post_id, Post);

            post.like_count -= 1;

            let mut author_profile = get!(world, post.author, Profile);
            if author_profile.reputation >= 2 {
                author_profile.reputation -= 2;
            }

            set!(world, (post, author_profile));
        }
    }
}

#[dojo::interface]
trait IFollowSystem {
    fn follow(ref world: IWorldDispatcher, target: ContractAddress);
    fn unfollow(ref world: IWorldDispatcher, target: ContractAddress);
}

#[dojo::contract]
mod follow_system {
    use super::{IFollowSystem, Follow, Profile};
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};

    #[abi(embed_v0)]
    impl FollowSystemImpl of IFollowSystem<ContractState> {
        fn follow(ref world: IWorldDispatcher, target: ContractAddress) {
            let caller = get_caller_address();
            assert(caller != target, 'Cannot follow yourself');

            let mut follower_profile = get!(world, caller, Profile);
            let mut target_profile = get!(world, target, Profile);

            assert(follower_profile.created_at != 0, 'Profile does not exist');
            assert(target_profile.created_at != 0, 'Target profile does not exist');

            let follow = Follow {
                follower: caller,
                following: target,
                timestamp: get_block_timestamp(),
            };

            follower_profile.following_count += 1;
            target_profile.follower_count += 1;

            set!(world, (follow, follower_profile, target_profile));
        }

        fn unfollow(ref world: IWorldDispatcher, target: ContractAddress) {
            let caller = get_caller_address();

            let mut follower_profile = get!(world, caller, Profile);
            let mut target_profile = get!(world, target, Profile);

            if follower_profile.following_count > 0 {
                follower_profile.following_count -= 1;
            }
            if target_profile.follower_count > 0 {
                target_profile.follower_count -= 1;
            }

            set!(world, (follower_profile, target_profile));
        }
    }
}

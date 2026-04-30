package com.socialize.service;

import com.socialize.dto.FollowResponse;
import com.socialize.dto.FollowUserResponse;
import com.socialize.entity.Follow;
import com.socialize.entity.User;
import com.socialize.exception.UnauthorizedException;
import com.socialize.exception.UserNotFoundException;
import com.socialize.repository.FollowRepository;
import com.socialize.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowService(FollowRepository followRepository,
                         UserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    //Follow user
    public Map<String, String> followUser(String email, Long followeeId) {
        User follower = getUserByEmail(email);
        User followee = getUserById(followeeId);
        if (follower.getUserId().equals(followeeId)) {
            throw new UnauthorizedException("You cannot follow yourself");
        }

        if (followRepository.existsByFollowerUserIdAndFolloweeUserId(
                follower.getUserId(), followeeId)) {
            return Map.of("message", "Already following");
        }
        Follow follow = Follow.builder()
                .follower(follower)
                .followee(followee)
                .build();
        followRepository.save(follow);
        return Map.of("message", "Followed successfully");
    }

    //Unfollow
    @Transactional
    public Map<String, String> unfollowUser(String email, Long followeeId) {
        User follower = getUserByEmail(email);
        if (!followRepository.existsByFollowerUserIdAndFolloweeUserId(
                follower.getUserId(), followeeId)) {
            return Map.of("message", "Not following");
        }
        followRepository.deleteByFollowerUserIdAndFolloweeUserId(
                follower.getUserId(), followeeId
        );
        return Map.of("message", "Unfollowed successfully");
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    //Followers count
    public long getFollowersCount(Long userId) {
        return followRepository.countByFolloweeUserId(userId);
    }

    //Following count
    public long getFollowingCount(Long userId) {
        return followRepository.countByFollowerUserId(userId);
    }

    //List followers
    public List<FollowUserResponse> getFollowers(Long userId) {
        return followRepository.findByFolloweeUserId(userId)
                .stream()
                .map(f -> new FollowUserResponse(
                        f.getFollower().getUserId(),
                        f.getFollower().getName()
                ))
                .toList();
    }

    //List following
    public List<FollowUserResponse> getFollowing(Long userId) {
        return followRepository.findByFollowerUserId(userId)
                .stream()
                .map(f -> new FollowUserResponse(
                        f.getFollowee().getUserId(),
                        f.getFollowee().getName()
                ))
                .toList();
    }
    public FollowResponse getFollowStatsByEmail(String email) {
        User user = getUserByEmail(email);
        long followers = followRepository.countByFolloweeUserId(user.getUserId());
        long following = followRepository.countByFollowerUserId(user.getUserId());
        return new FollowResponse(followers, following);
    }

    //Mapper
    public FollowResponse getFollowStats(Long userId) {
        long followers = followRepository.countByFolloweeUserId(userId);
        long following = followRepository.countByFollowerUserId(userId);
        return new FollowResponse(followers, following);
    }
}

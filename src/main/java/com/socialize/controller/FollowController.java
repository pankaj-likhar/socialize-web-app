package com.socialize.controller;

import com.socialize.dto.FollowResponse;
import com.socialize.dto.FollowUserResponse;
import com.socialize.service.FollowService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {

    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    // follow
    @PostMapping
    public ResponseEntity<?> follow(
            @RequestParam Long followeeId,
            Authentication auth) {

        return ResponseEntity.ok(
                followService.followUser(auth.getName(), followeeId)
        );
    }

    // unfollow
    @DeleteMapping
    public ResponseEntity<?> unfollow(
            @RequestParam Long followeeId,
            Authentication auth) {

        return ResponseEntity.ok(
                followService.unfollowUser(auth.getName(), followeeId)
        );
    }

    // followers count
    @GetMapping("/followers/count/{userId}")
    public ResponseEntity<Long> followersCount(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowersCount(userId));
    }

    // following count
    @GetMapping("/following/count/{userId}")
    public ResponseEntity<Long> followingCount(@PathVariable Long userId) {
        return ResponseEntity.ok(followService.getFollowingCount(userId));
    }

    @GetMapping("/stats/{userId}")
    public FollowResponse getStats(@PathVariable Long userId) {
        return followService.getFollowStats(userId);
    }

    @GetMapping("/me")
    public FollowResponse getMyStats(Authentication auth) {
        return followService.getFollowStatsByEmail(auth.getName());
    }

    @GetMapping("/followers/{userId}")
    public List<FollowUserResponse> getFollowers(@PathVariable Long userId) {
        return followService.getFollowers(userId);
    }

    @GetMapping("/following/{userId}")
    public List<FollowUserResponse> getFollowing(@PathVariable Long userId) {
        return followService.getFollowing(userId);
    }
}

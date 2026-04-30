package com.socialize.controller;

import com.socialize.dto.LikeResponse;
import com.socialize.dto.PostResponse;
import com.socialize.service.LikeService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService){
        this.likeService = likeService;
    }

    //Like post
    @PostMapping("/{postId}")
    public ResponseEntity<?> likePost(@PathVariable Long postId, Authentication auth) {
        return ResponseEntity.ok(likeService.likePost(auth.getName(), postId));
    }

    //Unlike post
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> unlikePost(@PathVariable Long postId, Authentication auth) {
        return ResponseEntity.ok(likeService.unlikePost(auth.getName(), postId));
    }

    //Count likes
    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> getLikeCount(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.countLikes(postId));
    }

    @GetMapping("/{postId}")
    public LikeResponse getLikeStatus(
            @PathVariable Long postId,
            Authentication auth) {

        return likeService.getLikeStatus(auth.getName(), postId);
    }

    @GetMapping("/me")
    public Page<PostResponse> getMyLikedPosts(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return likeService.getLikedPosts(auth.getName(), page, size);
    }
}

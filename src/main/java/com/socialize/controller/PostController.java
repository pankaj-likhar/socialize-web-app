package com.socialize.controller;

import com.socialize.dto.PostResponse;
import com.socialize.entity.Post;
import com.socialize.entity.User;
import com.socialize.service.PostService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    //create post
    @PostMapping(consumes = {"multipart/form-data"})
    public PostResponse createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "image", required = false) MultipartFile image,
            Authentication auth) {

        return postService.createNewPost(content, image, auth.getName());
    }

    //feed posts
    @GetMapping("/feed")
    public Page<PostResponse> getFeed(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return postService.getFeed(auth.getName(), page, size);
    }

    // Get logged-in user's posts
    @GetMapping("/me")
    public Page<PostResponse> getMyPosts(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return postService.getAllPostsOfUser(auth.getName(), page, size);
    }

    //get all posts
    @GetMapping
    public Page<PostResponse> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return postService.getAllPosts(page, size);
    }

    // Update post
    @PatchMapping("/{postId}")
    public PostResponse editPost(@RequestBody Post post,
                                 @PathVariable Long postId,
                                 Authentication auth) {

        return postService.editPostContent(post, postId, auth.getName());
    }

    // Delete post
    @DeleteMapping("/{postId}")
    public String deletePost(@PathVariable Long postId,
                             Authentication auth) {

        return postService.deletePost(postId, auth.getName());
    }
}

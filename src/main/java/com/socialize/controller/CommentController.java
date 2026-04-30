package com.socialize.controller;

import com.socialize.dto.CommentRequest;
import com.socialize.dto.CommentResponse;
import com.socialize.entity.Comment;
import com.socialize.entity.Post;
import com.socialize.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    //create comment for post
    @PostMapping("/{postId}")
    public CommentResponse createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest request,
            Authentication auth) {

        return commentService.createComment(auth.getName(), postId, request);
    }

    //get all comments of a post
    @GetMapping("/{postId}")
    public Page<CommentResponse> getComments(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return commentService.getCommentsByPost(postId, page, size);
    }
}

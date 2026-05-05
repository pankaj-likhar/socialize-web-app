package com.socialize.service;

import com.socialize.dto.CommentEvent;
import com.socialize.dto.CommentRequest;
import com.socialize.dto.CommentResponse;
import com.socialize.entity.Comment;
import com.socialize.entity.Post;
import com.socialize.entity.User;
import com.socialize.exception.BadRequestException;
import com.socialize.exception.PostNotFoundException;
import com.socialize.exception.UserNotFoundException;
import com.socialize.repository.CommentRepository;
import com.socialize.repository.PostRepository;
import com.socialize.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository,
                          UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    //create comment
    public CommentResponse createComment(String email, Long postId, CommentRequest request) {
        if (request.getCommentText() == null || request.getCommentText().isBlank()) {
            throw new BadRequestException("Comment cannot be empty");
        }
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new PostNotFoundException("Post not found"));
        Comment newComment = new Comment();
        newComment.setCommentText(request.getCommentText());
        newComment.setUser(user);
        newComment.setPost(post);
        Comment saved = commentRepository.save(newComment);

        CommentResponse response = mapToDTO(saved);

        // 🔥 REAL-TIME PUSH
        messagingTemplate.convertAndSend(
                "/topic/comments/" + postId,
                new CommentEvent(postId, response)
        );

        return response;
//        return mapToDTO(saved);
    }

    //get all comments of a post
    public Page<CommentResponse> getCommentsByPost(Long postId, int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );
        return commentRepository.findByPostPostId(postId, pageable)
                .map(this::mapToDTO);
    }

    //Mapper
    private CommentResponse mapToDTO(Comment comment) {
        return CommentResponse.builder()
                .commentId(comment.getCommentId())
                .commentText(comment.getCommentText())
                .createdAt(comment.getCreatedAt())
                .userId(comment.getUser().getUserId())
                .userName(comment.getUser().getName())
                .postId(comment.getPost().getPostId())
                .build();
    }
}

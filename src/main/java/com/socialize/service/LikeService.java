package com.socialize.service;

import com.socialize.dto.LikeEvent;
import com.socialize.dto.LikeResponse;
import com.socialize.dto.PostResponse;
import com.socialize.entity.Like;
import com.socialize.entity.Post;
import com.socialize.entity.User;
import com.socialize.exception.LikeNotFoundException;
import com.socialize.exception.PostNotFoundException;
import com.socialize.exception.UserNotFoundException;
import com.socialize.repository.LikeRepository;
import com.socialize.repository.PostRepository;
import com.socialize.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public LikeService(LikeRepository likeRepository, PostRepository postRepository,
                       UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    //like post
    public Map<String, String> likePost(String email, Long postId) {
        User user = getUser(email);

        if (likeRepository.existsByUserUserIdAndPostPostId(user.getUserId(), postId)) {
            return Map.of("message", "Already liked");
        }

        Post post = getPost(postId);
        likeRepository.save(Like.builder().user(user).post(post).build());

        long count = likeRepository.countByPostPostId(postId);

        // 🔥 SEND EVENT
        messagingTemplate.convertAndSend(
                "/topic/likes/" + postId,
                new LikeEvent(postId, count)
        );

        return Map.of("message", "Post liked");
    }

    //unlike post
    @Transactional
    public Map<String, String> unlikePost(String email, Long postId) {
        User user = getUser(email);
        if (!likeRepository.existsByUserUserIdAndPostPostId(user.getUserId(), postId)) {
            throw new LikeNotFoundException("Like not found");
        }
        likeRepository.deleteByUserUserIdAndPostPostId(user.getUserId(), postId);

        long count = likeRepository.countByPostPostId(postId);

        // 🔥 SEND EVENT
        messagingTemplate.convertAndSend(
                "/topic/likes/" + postId,
                new LikeEvent(postId, count)
        );
        return Map.of("message", "Post unliked");
    }

    //count likes on a post
    public long countLikes(Long postId) {
        return likeRepository.countByPostPostId(postId);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private Post getPost(Long postId) {
        return postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException("Post not found"));
    }

    public LikeResponse getLikeStatus(String email, Long postId) {
        User user = getUser(email);
        boolean liked = likeRepository.existsByUserUserIdAndPostPostId(
                user.getUserId(),
                postId
        );
        long count = likeRepository.countByPostPostId(postId);
        return new LikeResponse(count, liked);
    }

    public Page<PostResponse> getLikedPosts(String email, int page, int size) {
        User user = getUser(email);
        Pageable pageable = PageRequest.of(page, size);
        return likeRepository.findLikedPosts(user.getUserId(), pageable)
                .map(like -> mapPostToDTO(like.getPost()));
    }

    //Mapper
    private PostResponse mapPostToDTO(Post post) {
        return PostResponse.builder()
                .postId(post.getPostId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .userId(post.getUser().getUserId())
                .userName(post.getUser().getName())
                .build();
    }
}

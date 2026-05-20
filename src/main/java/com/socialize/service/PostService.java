package com.socialize.service;

import com.socialize.dto.PostResponse;
import com.socialize.entity.Post;
import com.socialize.entity.User;
import com.socialize.exception.BadRequestException;
import com.socialize.exception.PostNotFoundException;
import com.socialize.exception.UnauthorizedException;
import com.socialize.exception.UserNotFoundException;
import com.socialize.repository.FollowRepository;
import com.socialize.repository.PostRepository;
import com.socialize.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final FollowRepository followRepository;
    private final ImageUploadService imageUploadService;

    public PostService(PostRepository postRepository, UserRepository userRepository,
                       FollowRepository followRepository,  ImageUploadService imageUploadService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.followRepository = followRepository;
        this.imageUploadService = imageUploadService;
    }

    //create new post
    public PostResponse createNewPost(String content,
                                      MultipartFile image,
                                      String email) {

        if (content == null || content.isBlank()) {
            throw new BadRequestException("Post content cannot be empty");
        }

        User user = findUserByEmail(email);

        Post newPost = new Post();
        newPost.setContent(content);
        newPost.setUser(user);

        // Upload image if provided
        if (image != null && !image.isEmpty()) {
            Map uploadResult = imageUploadService.uploadImage(image);

            newPost.setImageUrl((String) uploadResult.get("secure_url"));
            newPost.setImagePublicId((String) uploadResult.get("public_id"));
        }

        Post savedPost = postRepository.save(newPost);
        return mapToDTO(savedPost);
    }

    //get all posts of a user
    public Page<PostResponse> getAllPostsOfUser(String email, int page, int size) {
        User user = findUserByEmail(email);
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );
        return postRepository.findByUserUserId(user.getUserId(), pageable)
                .map(this::mapToDTO);
    }

    //get all posts
    public Page<PostResponse> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );
        return postRepository.findAll(pageable)
                .map(this::mapToDTO);
    }

    //posts show to user's feed
    public Page<PostResponse> getFeed(String email, int page, int size) {
        User user = findUserByEmail(email);
        List<Long> followeeIds = followRepository.findByFollowerUserId(user.getUserId())
                .stream()
                .map(f -> f.getFollowee().getUserId())
                .collect(java.util.stream.Collectors.toList());

        followeeIds.add(user.getUserId());
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );
        return postRepository.findByUserUserIdIn(followeeIds, pageable)
                .map(this::mapToDTO);
    }

    //update post content by authorized user
    @Transactional
    public PostResponse editPostContent(Post post, Long postId, String email) {
        User user = findUserByEmail(email);
        Post postFound = findPost(postId);
        if (!postFound.getUser().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedException("You are not allowed to edit this post");
        }
        if (post.getContent() == null || post.getContent().isBlank()) {
            throw new BadRequestException("Post content cannot be empty");
        }
        postFound.setContent(post.getContent());
        Post updatedPost = postRepository.save(postFound);
        return mapToDTO(updatedPost);
    }

    //delete post
    @Transactional
    public String deletePost(Long postId, String email) {
        User user = findUserByEmail(email);
        Post post = findPost(postId);

        if (!post.getUser().getUserId().equals(user.getUserId())) {
            throw new UnauthorizedException("You are not allowed to delete this post");
        }

        // Delete image from Cloudinary if it exists
        if (post.getImagePublicId() != null && !post.getImagePublicId().isBlank()) {
            imageUploadService.deleteImage(post.getImagePublicId());
        }

        // Delete post from database
        postRepository.delete(post);

        return "Post deleted successfully";
    }

    //find user
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    //find post
    private Post findPost(Long postId) {
        return postRepository.findById(postId).orElseThrow(() -> new PostNotFoundException("Post not found"));
    }

    //Mapper
    private PostResponse mapToDTO(Post post) {
        return PostResponse.builder()
                .postId(post.getPostId())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .userId(post.getUser().getUserId())
                .userName(post.getUser().getName())
                .imageUrl(post.getImageUrl())
                .build();
    }
}

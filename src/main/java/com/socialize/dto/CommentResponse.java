package com.socialize.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CommentResponse {

    private Long commentId;
    private String commentText;
    private LocalDateTime createdAt;

    private Long userId;
    private String userName;

    private Long postId;
}

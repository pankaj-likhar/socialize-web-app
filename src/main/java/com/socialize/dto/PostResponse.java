package com.socialize.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostResponse {

    private Long postId;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;

    private Long userId;
    private String userName;
}

package com.socialize.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentEvent {

    private Long postId;
    private CommentResponse comment;
}

package com.socialize.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FollowUserResponse {

    private Long userId;
    private String name;
}

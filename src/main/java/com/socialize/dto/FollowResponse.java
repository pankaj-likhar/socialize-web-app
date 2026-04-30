package com.socialize.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FollowResponse {

    private long followers;
    private long following;
}

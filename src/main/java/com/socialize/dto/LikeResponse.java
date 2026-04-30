package com.socialize.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeResponse {

    private long count;
    private boolean liked;
}

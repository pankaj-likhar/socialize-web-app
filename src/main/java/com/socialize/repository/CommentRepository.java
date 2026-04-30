package com.socialize.repository;

import com.socialize.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @EntityGraph(attributePaths = {"user", "post"})
    Page<Comment> findByPostPostId(Long postId, Pageable pageable);

    Page<Comment> findByUserUserId(Long userId, Pageable pageable);
}

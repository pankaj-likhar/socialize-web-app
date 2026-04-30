package com.socialize.repository;

import com.socialize.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @EntityGraph(attributePaths = {"user"})
    Page<Post> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<Post> findByUserUserId(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user"})
    Page<Post> findByUserUserIdIn(List<Long> userIds, Pageable pageable);
}

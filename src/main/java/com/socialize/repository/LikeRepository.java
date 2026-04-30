package com.socialize.repository;

import com.socialize.entity.Like;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {

    @Query("""
    SELECT l FROM Like l
    JOIN l.post p
    JOIN p.user
    WHERE l.user.userId = :userId
    ORDER BY p.createdAt DESC
    """)
    Page<Like> findLikedPosts(Long userId, Pageable pageable);

    Long countByPostPostId(Long postId);

    void deleteByUserUserIdAndPostPostId(Long userId, Long postId);

    boolean existsByUserUserIdAndPostPostId(Long userId, Long postId);
}

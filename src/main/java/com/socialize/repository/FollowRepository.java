package com.socialize.repository;

import com.socialize.entity.Follow;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {

    Optional<Follow> findByFollowerUserIdAndFolloweeUserId(Long followerId, Long followeeId);

    boolean existsByFollowerUserIdAndFolloweeUserId(Long followerId, Long followeeId);

    void deleteByFollowerUserIdAndFolloweeUserId(Long followerId, Long followeeId);

    long countByFolloweeUserId(Long userId); // followers count

    long countByFollowerUserId(Long userId); // following count

    @EntityGraph(attributePaths = {"follower", "followee"})
    List<Follow> findByFollowerUserId(Long followerId); // who I follow

    @EntityGraph(attributePaths = {"follower", "followee"})
    List<Follow> findByFolloweeUserId(Long followeeId); // my followers
}

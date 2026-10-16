package com.dayflow.repository;

import com.dayflow.entity.WaterLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WaterLogRepository extends JpaRepository<WaterLog, Long> {

    List<WaterLog> findByUserIdOrderByLoggedAtDesc(Long userId);

    Optional<WaterLog> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(SUM(w.amountMl), 0) FROM WaterLog w WHERE w.user.id = :userId AND w.loggedAt >= :start AND w.loggedAt < :end")
    Integer sumAmountByUserIdAndLoggedAtBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    List<WaterLog> findByUserIdAndLoggedAtBetweenOrderByLoggedAtDesc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );
}

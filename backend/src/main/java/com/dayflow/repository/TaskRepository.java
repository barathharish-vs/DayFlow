package com.dayflow.repository;

import com.dayflow.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserIdOrderByDueDateAscDueTimeAscCreatedAtDesc(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND (:completed IS NULL OR t.completed = :completed) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:dueDate IS NULL OR t.dueDate = :dueDate) " +
           "ORDER BY t.dueDate ASC, t.dueTime ASC, t.createdAt DESC")
    List<Task> findFiltered(
            @Param("userId") Long userId,
            @Param("completed") Boolean completed,
            @Param("category") String category,
            @Param("priority") String priority,
            @Param("dueDate") LocalDate dueDate
    );
}

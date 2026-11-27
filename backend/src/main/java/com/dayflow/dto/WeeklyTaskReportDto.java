package com.dayflow.dto;

import java.time.LocalDate;
import java.util.List;

public class WeeklyTaskReportDto {

    private LocalDate weekStartDate; // Monday
    private LocalDate weekEndDate;   // Sunday
    private int totalTasksDue;
    private int tasksCompleted;
    private int tasksPending;
    private int tasksOverdue;
    private double completionRate;
    private int completedOnTime;
    private int completedLate;
    private Integer previousWeekCompleted;
    private PriorityBreakdownDto priorityBreakdown;
    private List<DailyWorkloadDto> dailyWorkload;
    private List<TaskDto> completedTasks;
    private List<TaskDto> pendingTasks;

    public WeeklyTaskReportDto() {}

    public static class PriorityBreakdownDto {
        private int low;
        private int medium;
        private int high;

        public PriorityBreakdownDto() {}
        public PriorityBreakdownDto(int low, int medium, int high) {
            this.low = low;
            this.medium = medium;
            this.high = high;
        }

        public int getLow() { return low; }
        public void setLow(int low) { this.low = low; }
        public int getMedium() { return medium; }
        public void setMedium(int medium) { this.medium = medium; }
        public int getHigh() { return high; }
        public void setHigh(int high) { this.high = high; }
    }

    public static class DailyWorkloadDto {
        private String dayOfWeek; // "Mon"
        private LocalDate date;
        private int tasksDue;
        private int tasksCompleted;

        public DailyWorkloadDto() {}
        public DailyWorkloadDto(String dayOfWeek, LocalDate date, int tasksDue, int tasksCompleted) {
            this.dayOfWeek = dayOfWeek;
            this.date = date;
            this.tasksDue = tasksDue;
            this.tasksCompleted = tasksCompleted;
        }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }
        public int getTasksDue() { return tasksDue; }
        public void setTasksDue(int tasksDue) { this.tasksDue = tasksDue; }
        public int getTasksCompleted() { return tasksCompleted; }
        public void setTasksCompleted(int tasksCompleted) { this.tasksCompleted = tasksCompleted; }
    }

    public LocalDate getWeekStartDate() { return weekStartDate; }
    public void setWeekStartDate(LocalDate weekStartDate) { this.weekStartDate = weekStartDate; }

    public LocalDate getWeekEndDate() { return weekEndDate; }
    public void setWeekEndDate(LocalDate weekEndDate) { this.weekEndDate = weekEndDate; }

    public int getTotalTasksDue() { return totalTasksDue; }
    public void setTotalTasksDue(int totalTasksDue) { this.totalTasksDue = totalTasksDue; }

    public int getTasksCompleted() { return tasksCompleted; }
    public void setTasksCompleted(int tasksCompleted) { this.tasksCompleted = tasksCompleted; }

    public int getTasksPending() { return tasksPending; }
    public void setTasksPending(int tasksPending) { this.tasksPending = tasksPending; }

    public int getTasksOverdue() { return tasksOverdue; }
    public void setTasksOverdue(int tasksOverdue) { this.tasksOverdue = tasksOverdue; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public int getCompletedOnTime() { return completedOnTime; }
    public void setCompletedOnTime(int completedOnTime) { this.completedOnTime = completedOnTime; }

    public int getCompletedLate() { return completedLate; }
    public void setCompletedLate(int completedLate) { this.completedLate = completedLate; }

    public Integer getPreviousWeekCompleted() { return previousWeekCompleted; }
    public void setPreviousWeekCompleted(Integer previousWeekCompleted) { this.previousWeekCompleted = previousWeekCompleted; }

    public PriorityBreakdownDto getPriorityBreakdown() { return priorityBreakdown; }
    public void setPriorityBreakdown(PriorityBreakdownDto priorityBreakdown) { this.priorityBreakdown = priorityBreakdown; }

    public List<DailyWorkloadDto> getDailyWorkload() { return dailyWorkload; }
    public void setDailyWorkload(List<DailyWorkloadDto> dailyWorkload) { this.dailyWorkload = dailyWorkload; }

    public List<TaskDto> getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(List<TaskDto> completedTasks) { this.completedTasks = completedTasks; }

    public List<TaskDto> getPendingTasks() { return pendingTasks; }
    public void setPendingTasks(List<TaskDto> pendingTasks) { this.pendingTasks = pendingTasks; }
}

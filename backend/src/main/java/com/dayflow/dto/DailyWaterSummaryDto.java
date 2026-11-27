package com.dayflow.dto;

import java.util.List;

public class DailyWaterSummaryDto {

    private Integer todayTotal;
    private Integer dailyGoal;
    private Double progressPercentage;
    private List<DayTotalDto> weeklyHistory;

    public DailyWaterSummaryDto() {}

    public DailyWaterSummaryDto(Integer todayTotal, Integer dailyGoal, Double progressPercentage, List<DayTotalDto> weeklyHistory) {
        this.todayTotal = todayTotal;
        this.dailyGoal = dailyGoal;
        this.progressPercentage = progressPercentage;
        this.weeklyHistory = weeklyHistory;
    }

    public Integer getTodayTotal() {
        return todayTotal;
    }

    public void setTodayTotal(Integer todayTotal) {
        this.todayTotal = todayTotal;
    }

    public Integer getDailyGoal() {
        return dailyGoal;
    }

    public void setDailyGoal(Integer dailyGoal) {
        this.dailyGoal = dailyGoal;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public List<DayTotalDto> getWeeklyHistory() {
        return weeklyHistory;
    }

    public void setWeeklyHistory(List<DayTotalDto> weeklyHistory) {
        this.weeklyHistory = weeklyHistory;
    }

    public static class DayTotalDto {
        private String day;
        private Integer amount;
        private Integer goal;

        public DayTotalDto() {}

        public DayTotalDto(String day, Integer amount, Integer goal) {
            this.day = day;
            this.amount = amount;
            this.goal = goal;
        }

        public String getDay() {
            return day;
        }

        public void setDay(String day) {
            this.day = day;
        }

        public Integer getAmount() {
            return amount;
        }

        public void setAmount(Integer amount) {
            this.amount = amount;
        }

        public Integer getGoal() {
            return goal;
        }

        public void setGoal(Integer goal) {
            this.goal = goal;
        }
    }
}

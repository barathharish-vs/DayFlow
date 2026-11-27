package com.dayflow.dto;

import java.time.LocalDate;
import java.util.List;

public class WeeklyWaterReportDto {

    private LocalDate weekStartDate; // Monday
    private LocalDate weekEndDate;   // Sunday
    private int totalIntakeMl;
    private int averageDailyIntakeMl;
    private int dailyGoalMl;
    private int daysGoalMet;
    private int bestDayIntakeMl;
    private String bestDayName;
    private int lowestDayIntakeMl;
    private String lowestDayName;
    private Integer previousWeekTotalMl;
    private Double weekOverWeekChangePercent;
    private List<DailyIntakeDetailDto> dailyDetails;

    public WeeklyWaterReportDto() {}

    public static class DailyIntakeDetailDto {
        private String dayOfWeek; // e.g. "Mon"
        private LocalDate date;
        private int amountMl;
        private int goalMl;
        private double percentageAchieved;
        private boolean goalMet;
        private int logCount;

        public DailyIntakeDetailDto() {}

        public DailyIntakeDetailDto(String dayOfWeek, LocalDate date, int amountMl, int goalMl, double percentageAchieved, boolean goalMet, int logCount) {
            this.dayOfWeek = dayOfWeek;
            this.date = date;
            this.amountMl = amountMl;
            this.goalMl = goalMl;
            this.percentageAchieved = percentageAchieved;
            this.goalMet = goalMet;
            this.logCount = logCount;
        }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public int getAmountMl() { return amountMl; }
        public void setAmountMl(int amountMl) { this.amountMl = amountMl; }

        public int getGoalMl() { return goalMl; }
        public void setGoalMl(int goalMl) { this.goalMl = goalMl; }

        public double getPercentageAchieved() { return percentageAchieved; }
        public void setPercentageAchieved(double percentageAchieved) { this.percentageAchieved = percentageAchieved; }

        public boolean isGoalMet() { return goalMet; }
        public void setGoalMet(boolean goalMet) { this.goalMet = goalMet; }

        public int getLogCount() { return logCount; }
        public void setLogCount(int logCount) { this.logCount = logCount; }
    }

    public LocalDate getWeekStartDate() { return weekStartDate; }
    public void setWeekStartDate(LocalDate weekStartDate) { this.weekStartDate = weekStartDate; }

    public LocalDate getWeekEndDate() { return weekEndDate; }
    public void setWeekEndDate(LocalDate weekEndDate) { this.weekEndDate = weekEndDate; }

    public int getTotalIntakeMl() { return totalIntakeMl; }
    public void setTotalIntakeMl(int totalIntakeMl) { this.totalIntakeMl = totalIntakeMl; }

    public int getAverageDailyIntakeMl() { return averageDailyIntakeMl; }
    public void setAverageDailyIntakeMl(int averageDailyIntakeMl) { this.averageDailyIntakeMl = averageDailyIntakeMl; }

    public int getDailyGoalMl() { return dailyGoalMl; }
    public void setDailyGoalMl(int dailyGoalMl) { this.dailyGoalMl = dailyGoalMl; }

    public int getDaysGoalMet() { return daysGoalMet; }
    public void setDaysGoalMet(int daysGoalMet) { this.daysGoalMet = daysGoalMet; }

    public int getBestDayIntakeMl() { return bestDayIntakeMl; }
    public void setBestDayIntakeMl(int bestDayIntakeMl) { this.bestDayIntakeMl = bestDayIntakeMl; }

    public String getBestDayName() { return bestDayName; }
    public void setBestDayName(String bestDayName) { this.bestDayName = bestDayName; }

    public int getLowestDayIntakeMl() { return lowestDayIntakeMl; }
    public void setLowestDayIntakeMl(int lowestDayIntakeMl) { this.lowestDayIntakeMl = lowestDayIntakeMl; }

    public String getLowestDayName() { return lowestDayName; }
    public void setLowestDayName(String lowestDayName) { this.lowestDayName = lowestDayName; }

    public Integer getPreviousWeekTotalMl() { return previousWeekTotalMl; }
    public void setPreviousWeekTotalMl(Integer previousWeekTotalMl) { this.previousWeekTotalMl = previousWeekTotalMl; }

    public Double getWeekOverWeekChangePercent() { return weekOverWeekChangePercent; }
    public void setWeekOverWeekChangePercent(Double weekOverWeekChangePercent) { this.weekOverWeekChangePercent = weekOverWeekChangePercent; }

    public List<DailyIntakeDetailDto> getDailyDetails() { return dailyDetails; }
    public void setDailyDetails(List<DailyIntakeDetailDto> dailyDetails) { this.dailyDetails = dailyDetails; }
}

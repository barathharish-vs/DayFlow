package com.dayflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class UpdateSettingsRequest {

    @Min(value = 500, message = "Daily water goal must be at least 500ml")
    @Max(value = 10000, message = "Daily water goal cannot exceed 10000ml")
    private Integer dailyWaterGoal;

    @Min(value = 15, message = "Reminder frequency must be at least 15 minutes")
    @Max(value = 240, message = "Reminder frequency cannot exceed 240 minutes")
    private Integer waterReminderFrequency;

    private Boolean notificationsEnabled;

    private String theme;

    private String timezone;

    public UpdateSettingsRequest() {}

    public Integer getDailyWaterGoal() {
        return dailyWaterGoal;
    }

    public void setDailyWaterGoal(Integer dailyWaterGoal) {
        this.dailyWaterGoal = dailyWaterGoal;
    }

    public Integer getWaterReminderFrequency() {
        return waterReminderFrequency;
    }

    public void setWaterReminderFrequency(Integer waterReminderFrequency) {
        this.waterReminderFrequency = waterReminderFrequency;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
}

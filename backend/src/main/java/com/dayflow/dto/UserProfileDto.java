package com.dayflow.dto;

public class UserProfileDto {

    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private Integer dailyWaterGoal;
    private Boolean notificationsEnabled;
    private Boolean waterRemindersEnabled;
    private Boolean taskRemindersEnabled;
    private Integer waterReminderFrequency;
    private String theme;
    private String timezone;

    public UserProfileDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Integer getDailyWaterGoal() {
        return dailyWaterGoal;
    }

    public void setDailyWaterGoal(Integer dailyWaterGoal) {
        this.dailyWaterGoal = dailyWaterGoal;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public Boolean getWaterRemindersEnabled() {
        return waterRemindersEnabled;
    }

    public void setWaterRemindersEnabled(Boolean waterRemindersEnabled) {
        this.waterRemindersEnabled = waterRemindersEnabled;
    }

    public Boolean getTaskRemindersEnabled() {
        return taskRemindersEnabled;
    }

    public void setTaskRemindersEnabled(Boolean taskRemindersEnabled) {
        this.taskRemindersEnabled = taskRemindersEnabled;
    }

    public Integer getWaterReminderFrequency() {
        return waterReminderFrequency;
    }

    public void setWaterReminderFrequency(Integer waterReminderFrequency) {
        this.waterReminderFrequency = waterReminderFrequency;
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

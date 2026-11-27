package com.dayflow.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class WaterLogDto {

    private Long id;

    @NotNull(message = "Amount in ml is required")
    @Min(value = 10, message = "Amount must be at least 10ml")
    private Integer amount;

    private String containerType = "glass";

    private LocalDateTime timestamp;

    private String timeFormatted;

    private String notes;

    public WaterLogDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getContainerType() {
        return containerType;
    }

    public void setContainerType(String containerType) {
        this.containerType = containerType;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getTimeFormatted() {
        return timeFormatted;
    }

    public void setTimeFormatted(String timeFormatted) {
        this.timeFormatted = timeFormatted;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

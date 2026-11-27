package com.dayflow.controller;

import com.dayflow.dto.DailyWaterSummaryDto;
import com.dayflow.dto.WaterLogDto;
import com.dayflow.dto.WeeklyWaterReportDto;
import com.dayflow.service.WaterLogService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water")
public class WaterLogController {

    private final WaterLogService waterLogService;

    public WaterLogController(WaterLogService waterLogService) {
        this.waterLogService = waterLogService;
    }

    @GetMapping
    public ResponseEntity<List<WaterLogDto>> getLogs(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(waterLogService.getWaterLogs(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<WaterLogDto> addLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WaterLogDto dto
    ) {
        return ResponseEntity.ok(waterLogService.addWaterLog(userDetails.getUsername(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id
    ) {
        waterLogService.deleteWaterLog(userDetails.getUsername(), id);
        return ResponseEntity.ok(Map.of("message", "Water log deleted successfully"));
    }

    @PostMapping("/reset-today")
    public ResponseEntity<Map<String, String>> resetToday(@AuthenticationPrincipal UserDetails userDetails) {
        waterLogService.resetTodayWater(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("message", "Today's water logs reset successfully"));
    }

    @GetMapping("/summary")
    public ResponseEntity<DailyWaterSummaryDto> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(waterLogService.getWaterSummary(userDetails.getUsername()));
    }

    @GetMapping("/weekly-report")
    public ResponseEntity<WeeklyWaterReportDto> getWeeklyReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate
    ) {
        return ResponseEntity.ok(waterLogService.getWeeklyWaterReport(userDetails.getUsername(), targetDate));
    }
}

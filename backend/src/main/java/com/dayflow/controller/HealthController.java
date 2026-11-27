package com.dayflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * HealthController handles simple system status checks.
 *
 * Concepts:
 * - @RestController: Combines @Controller and @ResponseBody. Tells Spring that every method
 *   returns JSON data directly instead of rendering an HTML view template.
 * - @RequestMapping("/api"): Sets a common base URL path for all endpoints in this controller.
 * - @CrossOrigin: Allows requests coming from our frontend origin (like http://localhost:5173).
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class HealthController {

    /**
     * GET /api/health
     *
     * @GetMapping tells Spring to invoke this method when an HTTP GET request
     * arrives at the "/api/health" URL.
     *
     * Returning a Java Map causes Spring Boot (via Jackson) to automatically convert it
     * into a clean JSON object: {"status": "UP", "service": "DayFlow Backend", ...}
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "DayFlow Backend");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("message", "DayFlow Spring Boot backend is active and healthy!");

        return ResponseEntity.ok(response);
    }
}

package com.dayflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the DayFlow Spring Boot application.
 *
 * The @SpringBootApplication annotation enables:
 * 1. @Configuration: Tags the class as a source of bean definitions.
 * 2. @EnableAutoConfiguration: Tells Spring Boot to configure beans based on classpath settings.
 * 3. @ComponentScan: Tells Spring to scan for controllers, services, and components in this package and sub-packages.
 */
@SpringBootApplication
public class DayflowApplication {

    public static void main(String[] args) {
        SpringApplication.run(DayflowApplication.class, args);
    }
}

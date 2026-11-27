# DayFlow Deployment Guide

This directory contains containerization and deployment configurations for the DayFlow ecosystem.

## Deploying with Docker Compose

Ensure Docker and Docker Compose are installed and running.

1. Navigate to the `05-deployment/` directory:
   ```bash
   cd 05-deployment
   ```
2. Start all services (MySQL 8, Spring Boot Backend, and Nginx Frontend):
   ```bash
   docker compose up -d --build
   ```
3. Access services:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:8080/api
   - **MySQL**: localhost:3306
4. Teardown:
   ```bash
   docker compose down -v
   ```

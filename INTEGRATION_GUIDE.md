# TWSELA (توصيلة) — Backend Integration Guide

## 1. Overview for the Backend Engineering Team
This guide instructs the Spring Boot backend team on how to seamlessly connect and integrate the TWSELA frontend application. The frontend is built to communicate with Spring Boot 3.3.3 (Java 17) via standard REST endpoints and WebSocket channels.

---

## 2. Environment Variables & Connectivity

Create or modify `frontend/.env`:

```bash
# Backend REST Base URL
VITE_API_BASE_URL=http://localhost:8080/api

# Actuator Health URL
VITE_ACTUATOR_URL=http://localhost:8080/actuator

# Data Mode: 'live' or 'mock'
# Use 'mock' for standalone frontend demonstrations without backend running.
# Use 'live' for real HTTP communication with Spring Boot.
VITE_DATA_MODE=live

# WebSocket STOMP Endpoint
VITE_WS_URL=ws://localhost:8080/ws
```

---

## 3. Required Spring Boot Configuration

### 3.1. CORS Filter Configuration
To allow the frontend SPA to communicate with the backend, ensure your Spring Security or `WebMvcConfigurer` includes:

```java
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-Tenant-ID", "Accept")
                .exposedHeaders("Authorization", "Content-Disposition")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### 3.2. Authentication & JWT Headers
- **Transport**: Standard Bearer token in the `Authorization` header:
  `Authorization: Bearer <jwt-token>`
- **Tenant Scope**: When multi-tenancy is active, the frontend sends:
  `X-Tenant-ID: <tenant-slug-or-id>`
- **Token Claims**: The JWT payload must include:
  - `sub`: User ID or username
  - `role`: One of `OWNER`, `ADMIN`, `MERCHANT`, `COURIER`, `WAREHOUSE`
  - `tenantId`: Tenant identifier
  - `name`: Display name

---

## 4. Standard Response & Error Payload Formats

### 4.1. Success Page Response Format
```json
{
  "content": [ ... ],
  "totalElements": 1284,
  "totalPages": 65,
  "size": 20,
  "number": 0,
  "first": true,
  "last": false
}
```

### 4.2. Standard Error Envelope
When an error occurs, the frontend anticipates the Spring `ProblemDetail` or custom error payload:
```json
{
  "timestamp": "2026-10-20T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed: Phone number must follow Egyptian format (01xxxxxxxxx)",
  "path": "/api/shipments"
}
```

---

## 5. Live Mode Verification Checklist
- [ ] PostgreSQL / MySQL database running on standard port.
- [ ] Flyway migrations executed (tables for shipments, users, couriers, tenants, wallets).
- [ ] Redis instance running for caching and token blacklisting.
- [ ] Run backend with `mvn spring-boot:run` on port 8080.
- [ ] Set `VITE_DATA_MODE=live` in `frontend/.env`.
- [ ] Start frontend with `npm run dev`.
- [ ] Test authentication flow and shipment creation.

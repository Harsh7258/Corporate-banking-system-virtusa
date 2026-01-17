package org.example.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// @desc custom error handler for access denied 403
// @data map the error to use in frontend
@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {

    // @desc internal mapping of endpoints to specify the roles
    private static final Map<String, String> ROLE_REQUIRED_MAP = Map.of(
            "/api/admin/**", "ADMIN",
            "/api/rm/**", "RELATIONSHIP_MANAGER",
            "/api/analyst/**", "ANALYST");

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex)
            throws IOException {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        String role = auth != null
                ? auth.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .findFirst()
                        .orElse("UNKNOWN")
                : "UNKNOWN";

        // @desc Reads the role required using mapping URLs, dynamically requiredRole
        String requestPath = request.getRequestURI();
        String requiredRole = ROLE_REQUIRED_MAP.entrySet().stream()
                .filter(e -> pathMatches(e.getKey(), requestPath))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse("UNKNOWN");

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.FORBIDDEN.value());
        body.put("error", "Forbidden");
        body.put("message", "Access denied. Your role is " + role + ". " + requiredRole + " role required.");

        response.setStatus(HttpStatus.FORBIDDEN.value()); // 403
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        new ObjectMapper().writeValue(response.getOutputStream(), body);
    }

    // @desc Simple wildcard matcher for paths ending with /**
    private boolean pathMatches(String pattern, String path) {
        if (pattern.endsWith("/**")) {
            String base = pattern.substring(0, pattern.length() - 3);
            return path.startsWith(base);
        } else {
            return path.equals(pattern);
        }
    }
}

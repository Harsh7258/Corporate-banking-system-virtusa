package org.example.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class JwtAuthEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(@NotNull HttpServletRequest req, HttpServletResponse res, @NotNull AuthenticationException ex) throws IOException, ServletException {
        res.setContentType("application/json");

        if (ex instanceof DisabledException) {
            res.setStatus(403);
            res.getWriter().write("""
                {\s
                    "status":403, "error":"User disabled",
                    "message":"Your account is deactivated. Please contact admin."\s
                }
           \s""");
        } else {
            res.setStatus(401);
            res.getWriter().write("""
                {\s
                    "status":401, "error":"Authentication failed",
                    "message":"Invalid email or password"\s
                }
           \s""");
        }
    }
}

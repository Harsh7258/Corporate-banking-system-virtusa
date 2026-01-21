package org.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration config = new CorsConfiguration();

                // Allow both direct access and nginx proxy
                // config.setAllowedOrigins(
                // List.of(
                // "http://localhost:4200", // Direct frontend access
                // "http://localhost", // Nginx on port 80
                // "http://localhost:80" // Explicit port 80
                // ));

                // @desc for EC2 instance deployment, allow all origins (Public EC2 IP unknown)
                config.setAllowedOriginPatterns(List.of("*"));

                config.setAllowedMethods(
                                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

                config.setAllowedHeaders(
                                List.of("*") // Allow all headers
                );

                config.setExposedHeaders(
                                List.of("Authorization"));

                config.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);

                return source;
        }
}

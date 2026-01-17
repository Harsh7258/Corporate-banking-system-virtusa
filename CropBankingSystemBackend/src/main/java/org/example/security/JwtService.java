package org.example.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

//    private static final String SECRET_KEY = "your secret key";

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long EXPIRATION_TIME;

    // @desc generating token with new [payload] adding - userId, role, making it scalable
    public String generateToken(UserDetails userDetails) {
        CustomUserDetails customUserDetails = (CustomUserDetails) userDetails;
        User user = customUserDetails.getUser();

//        System.out.println("username jwt service: " + user.getEmail());
//        System.out.println("username: " + customUserDetails.getUsername());

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());   // Mongo ObjectId
        claims.put("role", user.getRole());   // ADMIN / RM / ANALYST

        return Jwts.builder()
                .setClaims(claims) // map - userId, role
                .setSubject(user.getEmail()) // set email
                .setIssuedAt(new Date()) // now
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // 2 hours
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes())) // own secret
                .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        return extractUsername(token).equals(userDetails.getUsername());
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}


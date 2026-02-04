package com.gotogether.user.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    @Value("${jwt.secret:GotogetherSecretKeyForJWTTokenGenerationAndValidationPurposeOnly2025}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600000}")  // 1 hour in milliseconds
    private long jwtExpiration;

    @Value("${jwt.refresh.expiration:604800000}")  // 7 days in milliseconds
    private long refreshTokenExpiration;

    @Value("${app.name:GoTogether}")
    private String appName;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate JWT Token for Access
     */
    public String generateAccessToken(Long userId, String email, String role) {
        return buildToken(userId, email, role, jwtExpiration);
    }

    /**
     * Generate Refresh Token
     */
    public String generateRefreshToken(Long userId, String email) {
        return buildToken(userId, email, "REFRESH", refreshTokenExpiration);
    }

    /**
     * Build JWT Token
     */
    private String buildToken(Long userId, String email, String role, long expirationTime) {
        try {
            return Jwts.builder()
                    .subject(email)
                    .claim("userId", userId)
                    .claim("role", role)
                    .claim("appName", appName)
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + expirationTime))
                    .signWith(getSigningKey())  // Fixed: Removed deprecated SignatureAlgorithm
                    .compact();
        } catch (Exception e) {
            log.error("Error generating JWT token: ", e);
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    /**
     * Validate JWT Token
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract Email from Token
     */
    public String getEmailFromToken(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extract User ID from Token
     */
    public Long getUserIdFromToken(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    /**
     * Extract Role from Token
     */
    public String getRoleFromToken(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    /**
     * Get Expiration Date from Token
     */
    public Date getExpirationFromToken(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        return getExpirationFromToken(token).before(new Date());
    }

    // Helper methods
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = parseClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

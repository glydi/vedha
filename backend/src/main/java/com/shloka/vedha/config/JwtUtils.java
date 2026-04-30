package com.shloka.vedha.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.sp==> Cloning from https://github.com/glydi/vedha
==> Checking out commit 03453e1a584112eb94befb8169a8889cbd72a57f in branch main
==> Downloaded 55MB in 1s. Extraction took 1s.
==> Using Node.js version 24.14.1 (default)
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
==> Running build command 'bash setup.sh'...
=====================================================
  Render Configuration Setup Script for Vedha
=====================================================
This script will help you configure your database
credentials across render.yaml and properties files.
Press ENTER to keep the current value shown in brackets.
--- 1. Database Configuration ---
--- 2. Security & Environment ---
Updating configuration files...
✅ Updated backend/src/main/resources/application-render.properties
✅ Updated backend/src/main/resources/application.properties
✅ Updated render.yaml
=====================================================
Setup complete! Your configurations are updated.
You can now commit these changes and push to Render.
=====================================================
==> Uploading build...
==> Uploaded in 1.5s. Compression took 1.0s
==> Build successful 🎉
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
==> Running 'bash run.sh'
Cleaning up existing processes...
Starting Backend...
Waiting for backend to start (this takes ~20 seconds)...
The JAVA_HOME environment variable is not defined correctly,
this environment variable is needed to run this program.ringframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtils {

    @Value("${vedha.jwt.secret:this-is-a-very-secure-static-secret-key-for-vedha-01}")
    private String secret;

    private SecretKey key;

    private SecretKey getKey() {
        if (key == null) {
            key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        }
        return key;
    }
    private final long expiration = 86400000; // 24 hours

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey())
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}

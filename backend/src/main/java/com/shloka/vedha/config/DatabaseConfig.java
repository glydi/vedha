package com.shloka.vedha.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Database configuration for Render deployment.
 * Render provides SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD
 * which are automatically picked up by Spring Boot from application-render.properties.
 * 
 * This configuration class can be extended in the future if custom datasource logic is needed.
 * For now, Spring Boot autoconfiguration handles the datasource based on environment variables.
 */
@Configuration
@Profile("render")
public class DatabaseConfig {
    // Spring Boot autoconfiguration handles datasource setup from environment variables
    // mapped through application-render.properties
}

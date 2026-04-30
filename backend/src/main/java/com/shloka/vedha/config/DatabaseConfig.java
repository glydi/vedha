package com.shloka.vedha.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Parses Render's DATABASE_URL (postgres://user:pass@host:port/db)
 * into JDBC format (jdbc:postgresql://host:port/db).
 * Only active when the "render" profile is enabled.
 */
@Configuration
@Profile("render")
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        DataSourceBuilder<?> builder = DataSourceBuilder.create();
        
        String databaseUrl = System.getenv("DATABASE_URL");

        if (databaseUrl != null && databaseUrl.startsWith("postgres")) {
            try {
                // postgres://user:password@host:port/dbname
                URI uri = new URI(databaseUrl.replace("postgres://", "http://")
                        .replace("postgresql://", "http://"));

                String host = uri.getHost();
                int port = uri.getPort();
                String path = uri.getPath();
                String userInfo = uri.getUserInfo();

                String jdbcUrl = String.format("jdbc:postgresql://%s:%d%s", host, port, path);
                builder.url(jdbcUrl);

                if (userInfo != null) {
                    String[] parts = userInfo.split(":", 2);
                    builder.username(parts[0]);
                    if (parts.length > 1) {
                        builder.password(parts[1]);
                    }
                }
            } catch (Exception e) {
                // Fallback to env vars set in application-render.properties
                System.err.println("Failed to parse DATABASE_URL: " + e.getMessage());
            }
        }
        
        return builder.build();
    }
}

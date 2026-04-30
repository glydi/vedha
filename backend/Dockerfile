# ── Stage 1: Build ──────────────────────────────────────
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

# Copy Maven wrapper and pom first for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build
COPY src/ src/
RUN ./mvnw package -DskipTests -B

# ── Stage 2: Run ────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

# Render sets PORT env var, default to 8080
ENV PORT=8080
EXPOSE ${PORT}

# Spring Boot reads environment variables and application-render.properties
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=render"]


# ── Build stage ────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies separately from source
COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn package -DskipTests -q

# ── Runtime stage ──────────────────────────────────────────────
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN groupadd -r jnjd && useradd -r -g jnjd jnjd
COPY --from=builder /app/target/*.jar app.jar
RUN chown jnjd:jnjd app.jar
USER jnjd

EXPOSE 8080

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-jar", "app.jar"]

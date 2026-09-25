# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
# Tải dependency trước để tận dụng cache khi chỉ sửa code
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ---- Run stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
# Giới hạn RAM cho gói free (512MB)
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY back_end_javaspringboot/target/dcf-production-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

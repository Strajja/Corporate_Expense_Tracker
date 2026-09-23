
FROM eclipse-temurin:26-jdk-alpine

WORKDIR /appdocker stop $(docker ps -a -q)

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
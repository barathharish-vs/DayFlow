FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
COPY src/ src/
RUN chmod +x mvnw && ./mvnw -B -DskipTests package
EXPOSE 8080
CMD ["sh", "-c", "java -jar target/*.jar --server.port=${PORT:-8080}"]

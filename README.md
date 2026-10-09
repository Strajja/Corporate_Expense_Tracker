# Corporate Expense Tracker

## 1. System Overview
The Corporate Expense Tracker is a full-stack enterprise web application developed as a comprehensive personal project to demonstrate advanced software engineering practices. It provides a robust solution for managing, categorizing, and analyzing business expenditures. The system is built on a decoupled client-server architecture, ensuring high scalability and maintainability for corporate financial tracking.

## 2. Core Technologies
* **Backend Framework:** Java with Spring Boot (REST API development, Dependency Injection, Data Access)
* **Frontend Framework:** React and Next.js (Server-Side Rendering, Component-Based UI, custom Hooks)
* **Architecture:** Decoupled Full-Stack, RESTful Services, MVC Pattern
* **Version Control:** Git & GitHub 

## 3. System Architecture & Features
* **Decoupled Architecture:** Independent frontend and backend environments communicating securely via RESTful endpoints, allowing for isolated scaling and deployment.
* **Transaction Management:** Complete CRUD capabilities for business expenses, ensuring accurate logging, filtering, and categorization of corporate spending.
* **Asynchronous State Management:** Dynamic user interfaces built with React, efficiently managing asynchronous data streams and loading states from the Spring Boot API.
* **Extensible API Design:** A well-documented backend structured to easily accommodate future integrations or mobile applications.

## 4. Interface Documentation

coming soon...<img width="1155" height="1155" alt="cet" src="https://github.com/user-attachments/assets/99853784-5eb0-4890-99ea-3b4df3eb2c30" />


## 5. Local Deployment Instructions

### Backend Setup (Spring Boot)
1. Navigate to the `backend` directory.
2. Ensure Java 17+ and your preferred build tool (Maven/Gradle) are installed.
3. Configure the `application.properties` file with your local database credentials.
4. Execute the application:
   ```bash
   mvn spring-boot:run

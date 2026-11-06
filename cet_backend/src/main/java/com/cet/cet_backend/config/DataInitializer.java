package com.cet.cet_backend.config;

import com.cet.cet_backend.domain.entities.Category;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.repository.ExpenseRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Initializes default system data on startup and continuously monitors the database.
 * Automatically replenishes demo users and expenses if the system drops to 1 or 0 users.
 */
@Configuration
@EnableScheduling
public class DataInitializer {

    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            ExpenseRepository expenseRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Executes once on application startup.
     */
    @Bean
    public CommandLineRunner initDefaultData() {
        return args -> {
            replenishDemoData();
        };
    }

    /**
     * Executes every 60 seconds while the application is running.
     * Ensures recruiters always have demo data available even if someone deletes it.
     */
    @Scheduled(fixedRate = 60000)
    public void monitorAndReplenish() {
        replenishDemoData();
    }

    private void replenishDemoData() {
        // If only 1 user remains (e.g. Admin) or database is completely empty
        if (userRepository.count() <= 1L) {
            System.out.println("DEMO REPLENISHER: Low user count detected. Generating full demo data suite...");

            String defaultPassword = passwordEncoder.encode("password");

            // Ensure Admin user exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                UserEntity admin = UserEntity.builder()
                        .firstName("System")
                        .lastName("Admin")
                        .emailAddress("admin@cet.com")
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .dateOfBirth(LocalDate.of(2000, 1, 1))
                        .hireDate(LocalDate.now())
                        .role(Role.ADMIN)
                        .build();
                userRepository.save(admin);
            }

            // Generate 6 Managers
            List<UserEntity> managers = List.of(
                    UserEntity.builder().firstName("Aleksandar").lastName("Jovanovic").emailAddress("aleksandar.jovanovic@cet.com").username("aleksandar.jovanovic").password(defaultPassword).dateOfBirth(LocalDate.of(1985, 5, 12)).hireDate(LocalDate.now()).role(Role.MANAGER).build(),
                    UserEntity.builder().firstName("Milica").lastName("Petrovic").emailAddress("milica.petrovic@cet.com").username("milica.petrovic").password(defaultPassword).dateOfBirth(LocalDate.of(1988, 8, 22)).hireDate(LocalDate.now()).role(Role.MANAGER).build(),
                    UserEntity.builder().firstName("Stefan").lastName("Nikolic").emailAddress("stefan.nikolic@cet.com").username("stefan.nikolic").password(defaultPassword).dateOfBirth(LocalDate.of(1982, 3, 15)).hireDate(LocalDate.now()).role(Role.MANAGER).build(),
                    UserEntity.builder().firstName("John").lastName("Smith").emailAddress("john.smith@cet.com").username("john.smith").password(defaultPassword).dateOfBirth(LocalDate.of(1984, 4, 10)).hireDate(LocalDate.now()).role(Role.MANAGER).build(),
                    UserEntity.builder().firstName("Emily").lastName("Davis").emailAddress("emily.davis@cet.com").username("emily.davis").password(defaultPassword).dateOfBirth(LocalDate.of(1989, 9, 18)).hireDate(LocalDate.now()).role(Role.MANAGER).build(),
                    UserEntity.builder().firstName("Michael").lastName("Brown").emailAddress("michael.brown@cet.com").username("michael.brown").password(defaultPassword).dateOfBirth(LocalDate.of(1983, 11, 25)).hireDate(LocalDate.now()).role(Role.MANAGER).build()
            );
            List<UserEntity> savedManagers = userRepository.saveAll(managers);

            // Generate 25 Employees
            String[][] employeeData = {
                    {"Nikola", "Djordjevic", "nikola.djordjevic@cet.com", "nikola.djordjevic", "1995-02-10"},
                    {"Jovana", "Markovic", "jovana.markovic@cet.com", "jovana.markovic", "1996-06-14"},
                    {"Luka", "Stojanovic", "luka.stojanovic@cet.com", "luka.stojanovic", "1993-11-30"},
                    {"Andjela", "Ilic", "andjela.ilic@cet.com", "andjela.ilic", "1997-04-18"},
                    {"Marko", "Pavlovic", "marko.pavlovic@cet.com", "marko.pavlovic", "1994-09-25"},
                    {"Teodora", "Popovic", "teodora.popovic@cet.com", "teodora.popovic", "1998-01-05"},
                    {"Milos", "Stankovic", "milos.stankovic@cet.com", "milos.stankovic", "1992-07-19"},
                    {"Katarina", "Kostic", "katarina.kostic@cet.com", "katarina.kostic", "1995-12-03"},
                    {"Uros", "Zivkovic", "uros.zivkovic@cet.com", "uros.zivkovic", "1991-03-27"},
                    {"Marija", "Milojevic", "marija.milojevic@cet.com", "marija.milojevic", "1996-10-08"},
                    {"Nemanja", "Kovacevic", "nemanja.kovacevic@cet.com", "nemanja.kovacevic", "1994-05-16"},
                    {"Sara", "Tomic", "sara.tomic@cet.com", "sara.tomic", "1997-08-21"},
                    {"Dusan", "Mitic", "dusan.mitic@cet.com", "dusan.mitic", "1993-02-14"},
                    {"Milena", "Ristic", "milena.ristic@cet.com", "milena.ristic", "1995-06-09"},
                    {"Filip", "Cvetkovic", "filip.cvetkovic@cet.com", "filip.cvetkovic", "1990-12-11"},
                    {"David", "Wilson", "david.wilson@cet.com", "david.wilson", "1994-01-15"},
                    {"Sarah", "Johnson", "sarah.johnson@cet.com", "sarah.johnson", "1996-03-22"},
                    {"James", "Taylor", "james.taylor@cet.com", "james.taylor", "1992-05-19"},
                    {"Emma", "Anderson", "emma.anderson@cet.com", "emma.anderson", "1997-07-11"},
                    {"Robert", "Thomas", "robert.thomas@cet.com", "robert.thomas", "1991-08-30"},
                    {"Olivia", "Jackson", "olivia.jackson@cet.com", "olivia.jackson", "1998-10-05"},
                    {"William", "White", "william.white@cet.com", "william.white", "1993-12-14"},
                    {"Sophia", "Harris", "sophia.harris@cet.com", "sophia.harris", "1995-04-28"},
                    {"Joseph", "Martin", "joseph.martin@cet.com", "joseph.martin", "1990-06-17"},
                    {"Isabella", "Thompson", "isabella.thompson@cet.com", "isabella.thompson", "1996-09-21"}
            };

            List<UserEntity> processedEmployees = new ArrayList<>();
            Random random = new Random();

            for (String[] data : employeeData) {
                UserEntity.UserEntityBuilder empBuilder = UserEntity.builder()
                        .firstName(data[0])
                        .lastName(data[1])
                        .emailAddress(data[2])
                        .username(data[3])
                        .password(defaultPassword)
                        .dateOfBirth(LocalDate.parse(data[4]))
                        .hireDate(LocalDate.now())
                        .role(Role.EMPLOYEE);

                // Assign a manager to roughly 80% of employees
                if (random.nextDouble() <= 0.8) {
                    UserEntity randomManager = savedManagers.get(random.nextInt(savedManagers.size()));

                    // Assuming UserEntity has a setManager or similar mapping for the relationship
                    // Adjust this mapping based on your exact UserEntity implementation if needed
                    // (e.g. empBuilder.managerId(...) if using an ID rather than object reference)
                    empBuilder.managerId(randomManager.getId());
                }

                processedEmployees.add(empBuilder.build());
            }

            List<UserEntity> savedEmployees = userRepository.saveAll(processedEmployees);

            System.out.println("Generating expenses for demo testing...");
            List<ExpenseEntity> demoExpenses = new ArrayList<>();

            // Generate 3 expenses for each Manager (All APPROVED)
            for (UserEntity mgr : savedManagers) {
                demoExpenses.add(ExpenseEntity.builder()
                        .description("Quarterly Software License")
                        .amount(new BigDecimal("1500.00"))
                        .category(Category.EDUCATION)
                        .status(Status.APPROVED)
                        .date(LocalDate.now().minusDays(10))
                        .employee(mgr)
                        .build());

                demoExpenses.add(ExpenseEntity.builder()
                        .description("Business Conference Ticket")
                        .amount(new BigDecimal("850.00"))
                        .category(Category.TRANSPORTATION)
                        .status(Status.APPROVED)
                        .date(LocalDate.now().minusDays(5))
                        .employee(mgr)
                        .build());

                demoExpenses.add(ExpenseEntity.builder()
                        .description("Team Building Event")
                        .amount(new BigDecimal("2200.00"))
                        .category(Category.REPRESENTATION)
                        .status(Status.APPROVED)
                        .date(LocalDate.now().minusDays(2))
                        .employee(mgr)
                        .build());
            }

            // Generate 3 expenses for each Employee (1 APPROVED, 1 PENDING, 1 REJECTED)
            for (UserEntity emp : savedEmployees) {
                demoExpenses.add(ExpenseEntity.builder()
                        .description("Client Lunch Meeting")
                        .amount(new BigDecimal("150.00"))
                        .category(Category.REPRESENTATION)
                        .status(Status.APPROVED)
                        .date(LocalDate.now().minusDays(7))
                        .employee(emp)
                        .build());

                demoExpenses.add(ExpenseEntity.builder()
                        .description("Monthly Transit Pass")
                        .amount(new BigDecimal("60.00"))
                        .category(Category.TRANSPORTATION)
                        .status(Status.PENDING)
                        .date(LocalDate.now().minusDays(1))
                        .employee(emp)
                        .build());

                demoExpenses.add(ExpenseEntity.builder()
                        .description("Ergonomic Keyboard")
                        .amount(new BigDecimal("250.00"))
                        .category(Category.EQUIPMENT)
                        .status(Status.REJECTED)
                        .comment("Budget exceeded for this quarter")
                        .date(LocalDate.now().minusDays(3))
                        .employee(emp)
                        .build());
            }

            expenseRepository.saveAll(demoExpenses);
            System.out.println("Demo data auto-replenishment complete.");
        }
    }
}
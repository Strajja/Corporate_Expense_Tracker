package com.cet.cet_backend.config;

import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

/**
 * Initializes default system data on startup, including admin, managers, and employees.
 */
@Configuration
public class DataInitializer {

    /**
     * Creates default users in the database if they do not already exist.
     */
    @Bean
    public CommandLineRunner initDefaultData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if database is empty to avoid duplicating records on every application restart
            if (userRepository.count() == 0L) {
                String defaultPassword = passwordEncoder.encode("password");

                // Create and save Admin user
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

                // Create and save 3 Managers
                List<UserEntity> managers = List.of(
                        UserEntity.builder().firstName("Aleksandar").lastName("Jovanović").emailAddress("aleksandar.jovanovic@cet.com").username("aleksandar.jovanovic").password(defaultPassword).dateOfBirth(LocalDate.of(1985, 5, 12)).hireDate(LocalDate.now()).role(Role.MANAGER).build(),
                        UserEntity.builder().firstName("Milica").lastName("Petrović").emailAddress("milica.petrovic@cet.com").username("milica.petrovic").password(defaultPassword).dateOfBirth(LocalDate.of(1988, 8, 22)).hireDate(LocalDate.now()).role(Role.MANAGER).build(),
                        UserEntity.builder().firstName("Stefan").lastName("Nikolić").emailAddress("stefan.nikolic@cet.com").username("stefan.nikolic").password(defaultPassword).dateOfBirth(LocalDate.of(1982, 3, 15)).hireDate(LocalDate.now()).role(Role.MANAGER).build()
                );
                userRepository.saveAll(managers);

                // Create and save 15 Employees
                List<UserEntity> employees = List.of(
                        UserEntity.builder().firstName("Nikola").lastName("Đorđević").emailAddress("nikola.djordjevic@cet.com").username("nikola.djordjevic").password(defaultPassword).dateOfBirth(LocalDate.of(1995, 2, 10)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Jovana").lastName("Marković").emailAddress("jovana.markovic@cet.com").username("jovana.markovic").password(defaultPassword).dateOfBirth(LocalDate.of(1996, 6, 14)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Luka").lastName("Stojanović").emailAddress("luka.stojanovic@cet.com").username("luka.stojanovic").password(defaultPassword).dateOfBirth(LocalDate.of(1993, 11, 30)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Anđela").lastName("Ilić").emailAddress("andjela.ilic@cet.com").username("andjela.ilic").password(defaultPassword).dateOfBirth(LocalDate.of(1997, 4, 18)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Marko").lastName("Pavlović").emailAddress("marko.pavlovic@cet.com").username("marko.pavlovic").password(defaultPassword).dateOfBirth(LocalDate.of(1994, 9, 25)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Teodora").lastName("Popović").emailAddress("teodora.popovic@cet.com").username("teodora.popovic").password(defaultPassword).dateOfBirth(LocalDate.of(1998, 1, 5)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Miloš").lastName("Stanković").emailAddress("milos.stankovic@cet.com").username("milos.stankovic").password(defaultPassword).dateOfBirth(LocalDate.of(1992, 7, 19)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Katarina").lastName("Kostić").emailAddress("katarina.kostic@cet.com").username("katarina.kostic").password(defaultPassword).dateOfBirth(LocalDate.of(1995, 12, 3)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Uroš").lastName("Živković").emailAddress("uros.zivkovic@cet.com").username("uros.zivkovic").password(defaultPassword).dateOfBirth(LocalDate.of(1991, 3, 27)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Marija").lastName("Milojević").emailAddress("marija.milojevic@cet.com").username("marija.milojevic").password(defaultPassword).dateOfBirth(LocalDate.of(1996, 10, 8)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Nemanja").lastName("Kovačević").emailAddress("nemanja.kovacevic@cet.com").username("nemanja.kovacevic").password(defaultPassword).dateOfBirth(LocalDate.of(1994, 5, 16)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Sara").lastName("Tomić").emailAddress("sara.tomic@cet.com").username("sara.tomic").password(defaultPassword).dateOfBirth(LocalDate.of(1997, 8, 21)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Dušan").lastName("Mitić").emailAddress("dusan.mitic@cet.com").username("dusan.mitic").password(defaultPassword).dateOfBirth(LocalDate.of(1993, 2, 14)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Milena").lastName("Ristić").emailAddress("milena.ristic@cet.com").username("milena.ristic").password(defaultPassword).dateOfBirth(LocalDate.of(1995, 6, 9)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build(),
                        UserEntity.builder().firstName("Filip").lastName("Cvetković").emailAddress("filip.cvetkovic@cet.com").username("filip.cvetkovic").password(defaultPassword).dateOfBirth(LocalDate.of(1990, 12, 11)).hireDate(LocalDate.now()).role(Role.EMPLOYEE).build()
                );
                userRepository.saveAll(employees);

                System.out.println(">>> Default users (Admin, 3 Managers, 15 Employees) successfully created with password 'password'");
            }
        };
    }
}
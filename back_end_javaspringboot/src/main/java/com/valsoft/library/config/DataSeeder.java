package com.valsoft.library.config;

import com.valsoft.library.entity.AppUser;
import com.valsoft.library.entity.Role;
import com.valsoft.library.repository.AppUserRepository;
import com.valsoft.library.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedAdmin(
            AppUserRepository userRepo,
            RoleRepository roleRepo,
            PasswordEncoder encoder
    ) {
        return args -> {
            // Ensure ADMIN role exists (created by Flyway, but just in case)
            Role adminRole = roleRepo.findByNameIgnoreCase("ADMIN").orElseGet(() -> {
                Role r = new Role();
                r.setName("ADMIN");
                return roleRepo.save(r);
            });

            // Create admin user if not exists
            if (!userRepo.existsByUsernameIgnoreCase("admin")) {
                AppUser admin = new AppUser();
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("123456"));
                admin.setFirstname("Admin");
                admin.setLastname("Admin");
                admin.setLanguage("en");
                admin.getRoles().add(adminRole);
                userRepo.save(admin);
                System.out.println(">>> Admin user created: admin / 123456");
            }
        };
    }
}

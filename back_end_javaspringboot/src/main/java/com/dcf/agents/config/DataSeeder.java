package com.dcf.agents.config;

import com.dcf.agents.entity.AppUser;
import com.dcf.agents.entity.Role;
import com.dcf.agents.repository.AppUserRepository;
import com.dcf.agents.repository.RoleRepository;
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

            // Create sample users user01...user50 with password = username
            for (int i = 1; i <= 50; i++) {
                String username = String.format("user%02d", i);
                if (!userRepo.existsByUsernameIgnoreCase(username)) {
                    AppUser user = new AppUser();
                    user.setUsername(username);
                    user.setPassword(encoder.encode(username)); // e.g. user01/user01
                    user.setFirstname("User");
                    user.setLastname(String.format("%02d", i));
                    user.setLanguage("en");
                    user.getRoles().add(adminRole);
                    userRepo.save(user);
                }
            }
        };
    }
}

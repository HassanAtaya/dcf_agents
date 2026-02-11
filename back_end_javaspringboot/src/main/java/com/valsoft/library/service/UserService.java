package com.valsoft.library.service;

import com.valsoft.library.dto.UserDto;
import com.valsoft.library.entity.AppUser;
import com.valsoft.library.entity.Role;
import com.valsoft.library.repository.AppUserRepository;
import com.valsoft.library.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public AppUser getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public AppUser createUser(UserDto dto) {
        if (userRepository.existsByUsernameIgnoreCase(dto.username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
        }
        AppUser user = new AppUser();
        user.setUsername(dto.username);
        user.setPassword(passwordEncoder.encode(dto.password));
        user.setFirstname(dto.firstname);
        user.setLastname(dto.lastname);
        user.setLanguage(dto.language != null ? dto.language : "en");
        if (dto.roleId != null) {
            Role role = roleRepository.findById(dto.roleId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }
        return userRepository.save(user);
    }

    public AppUser updateUser(Long id, UserDto dto) {
        AppUser user = getUserById(id);
        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin user cannot be edited");
        }
        if (dto.username != null) user.setUsername(dto.username);
        if (dto.password != null && !dto.password.isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.password));
        }
        if (dto.firstname != null) user.setFirstname(dto.firstname);
        if (dto.lastname != null) user.setLastname(dto.lastname);
        if (dto.language != null) user.setLanguage(dto.language);
        if (dto.roleId != null) {
            Role role = roleRepository.findById(dto.roleId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        AppUser user = getUserById(id);
        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin user cannot be deleted");
        }
        userRepository.deleteById(id);
    }
}

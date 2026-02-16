package com.dcf.agents.service;

import com.dcf.agents.dto.UserDto;
import com.dcf.agents.entity.AppUser;
import com.dcf.agents.entity.Role;
import com.dcf.agents.repository.AppUserRepository;
import com.dcf.agents.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    public static final String CACHE_USERS = "users";

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Cacheable(CACHE_USERS)
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public Page<AppUser> getAllUsers(Pageable pageable, String search) {
        if (search == null || search.isBlank()) {
            return userRepository.findAll(pageable);
        }
        return userRepository.findByUsernameContainingIgnoreCaseOrFirstnameContainingIgnoreCaseOrLastnameContainingIgnoreCase(
                search, search, search, pageable
        );
    }

    public AppUser getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @CacheEvict(value = CACHE_USERS, allEntries = true)
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

    @CacheEvict(value = CACHE_USERS, allEntries = true)
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

    @CacheEvict(value = CACHE_USERS, allEntries = true)
    public void deleteUser(Long id) {
        AppUser user = getUserById(id);
        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin user cannot be deleted");
        }
        userRepository.deleteById(id);
    }
}

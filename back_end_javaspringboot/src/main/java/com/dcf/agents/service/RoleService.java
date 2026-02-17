package com.dcf.agents.service;

import com.dcf.agents.dto.RoleDto;
import com.dcf.agents.entity.Permission;
import com.dcf.agents.entity.Role;
import com.dcf.agents.repository.PermissionRepository;
import com.dcf.agents.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoleService {

    public static final String CACHE_ROLES = "roles";

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Cacheable(CACHE_ROLES)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Page<Role> getAllRoles(Pageable pageable, String search) {
        if (search == null || search.isBlank()) {
            return roleRepository.findAll(pageable);
        }
        return roleRepository.findByNameContainingIgnoreCase(search, pageable);
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
    }

    @CacheEvict(value = CACHE_ROLES, allEntries = true)
    public Role createRole(RoleDto dto) {
        Role role = new Role();
        role.setName(dto.name);
        if (dto.permissionIds != null) {
            Set<Permission> perms = new HashSet<>(permissionRepository.findAllById(dto.permissionIds));
            role.setPermissions(perms);
        }
        return roleRepository.save(role);
    }

    @CacheEvict(value = CACHE_ROLES, allEntries = true)
    public Role updateRole(Long id, RoleDto dto) {
        Role role = getRoleById(id);
        if ("ADMIN".equalsIgnoreCase(role.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ADMIN role cannot be edited");
        }
        role.setName(dto.name);
        if (dto.permissionIds != null) {
            Set<Permission> perms = new HashSet<>(permissionRepository.findAllById(dto.permissionIds));
            role.setPermissions(perms);
        }
        return roleRepository.save(role);
    }

    @CacheEvict(value = CACHE_ROLES, allEntries = true)
    public void deleteRole(Long id) {
        Role role = getRoleById(id);
        if ("ADMIN".equalsIgnoreCase(role.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ADMIN role cannot be deleted");
        }
        roleRepository.deleteById(id);
    }
}

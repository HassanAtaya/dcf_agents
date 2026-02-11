package com.valsoft.library.service;

import com.valsoft.library.dto.RoleDto;
import com.valsoft.library.entity.Permission;
import com.valsoft.library.entity.Role;
import com.valsoft.library.repository.PermissionRepository;
import com.valsoft.library.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found"));
    }

    public Role createRole(RoleDto dto) {
        Role role = new Role();
        role.setName(dto.name);
        if (dto.permissionIds != null) {
            Set<Permission> perms = new HashSet<>(permissionRepository.findAllById(dto.permissionIds));
            role.setPermissions(perms);
        }
        return roleRepository.save(role);
    }

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

    public void deleteRole(Long id) {
        Role role = getRoleById(id);
        if ("ADMIN".equalsIgnoreCase(role.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ADMIN role cannot be deleted");
        }
        roleRepository.deleteById(id);
    }
}

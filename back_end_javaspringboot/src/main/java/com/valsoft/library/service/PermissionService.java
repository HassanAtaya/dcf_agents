package com.valsoft.library.service;

import com.valsoft.library.entity.Permission;
import com.valsoft.library.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Permission getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));
    }

    public Permission createPermission(Permission permission) {
        return permissionRepository.save(permission);
    }

    public Permission updatePermission(Long id, Permission data) {
        Permission permission = getPermissionById(id);
        if (data.getName() != null) permission.setName(data.getName());
        return permissionRepository.save(permission);
    }

    public void deletePermission(Long id) {
        Permission permission = getPermissionById(id);
        permissionRepository.delete(permission);
    }
}

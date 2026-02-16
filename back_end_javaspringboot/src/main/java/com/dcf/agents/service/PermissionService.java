package com.dcf.agents.service;

import com.dcf.agents.entity.Permission;
import com.dcf.agents.repository.PermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PermissionService {

    public static final String CACHE_PERMISSIONS = "permissions";

    @Autowired
    private PermissionRepository permissionRepository;

    @Cacheable(CACHE_PERMISSIONS)
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    public Page<Permission> getAllPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable);
    }

    public Permission getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));
    }

    @CacheEvict(value = CACHE_PERMISSIONS, allEntries = true)
    public Permission createPermission(Permission permission) {
        return permissionRepository.save(permission);
    }

    @CacheEvict(value = CACHE_PERMISSIONS, allEntries = true)
    public Permission updatePermission(Long id, Permission data) {
        Permission permission = getPermissionById(id);
        if (data.getName() != null) permission.setName(data.getName());
        return permissionRepository.save(permission);
    }

    @CacheEvict(value = CACHE_PERMISSIONS, allEntries = true)
    public void deletePermission(Long id) {
        Permission permission = getPermissionById(id);
        permissionRepository.delete(permission);
    }
}

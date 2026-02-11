package com.valsoft.library.controller;

import com.valsoft.library.entity.Permission;
import com.valsoft.library.service.PermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    @GetMapping
    public ResponseEntity<List<Permission>> getAll() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Permission> getById(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getPermissionById(id));
    }

    @PostMapping
    public ResponseEntity<Permission> create(@RequestBody Permission permission) {
        return ResponseEntity.ok(permissionService.createPermission(permission));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Permission> update(@PathVariable Long id, @RequestBody Permission data) {
        return ResponseEntity.ok(permissionService.updatePermission(id, data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
}

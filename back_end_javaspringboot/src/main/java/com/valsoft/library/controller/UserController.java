package com.valsoft.library.controller;

import com.valsoft.library.dto.UserDto;
import com.valsoft.library.entity.AppUser;
import com.valsoft.library.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<AppUser>> getAll() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUser> getById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<AppUser> create(@RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.createUser(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppUser> update(@PathVariable Long id, @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}

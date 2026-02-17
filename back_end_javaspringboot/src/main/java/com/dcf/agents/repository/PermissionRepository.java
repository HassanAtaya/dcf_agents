package com.dcf.agents.repository;

import com.dcf.agents.entity.Permission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Page<Permission> findByNameContainingIgnoreCase(String name, Pageable pageable);
}

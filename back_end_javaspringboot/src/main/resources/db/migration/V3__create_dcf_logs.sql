-- =============================================
-- DCF Logs table for KPI dashboard
-- =============================================
CREATE TABLE IF NOT EXISTS dcf_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    description TEXT,
    validation_status VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- =============================================
-- Add view_kpi permission
-- =============================================
INSERT INTO permissions (name) VALUES ('view_kpi');

-- Give ADMIN role the new permission (permission id=12)
INSERT INTO roles_permissions (role_id, permission_id) VALUES (1, 12);

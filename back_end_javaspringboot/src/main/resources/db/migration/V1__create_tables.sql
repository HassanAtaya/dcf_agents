-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    language VARCHAR(5) DEFAULT 'en'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Roles-Users join table
CREATE TABLE IF NOT EXISTS roles_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Roles-Permissions join table
CREATE TABLE IF NOT EXISTS roles_permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- AI Settings table
CREATE TABLE IF NOT EXISTS ai_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    `key` VARCHAR(500),
    prompt_agent1 TEXT,
    prompt_agent2 TEXT,
    prompt_agent3 TEXT,
    prompt_agent4 TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

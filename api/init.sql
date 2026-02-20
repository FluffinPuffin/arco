CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) DEFAULT '',
    avatar VARCHAR(255) DEFAULT '',
    grade VARCHAR(20) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    lesson_id VARCHAR(20) NOT NULL,
    part_completed JSON,
    current_part_index INT DEFAULT 0,
    percentage INT DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed data: test users
-- Passwords are bcrypt hashes of 'password123'
INSERT IGNORE INTO users (email, password_hash, display_name, grade) VALUES
('alice@test.com', '$2y$10$YQ9Rj6M5ZjK0vGwE8mN2aeXJHsNqYfMvkFdBpVcSJzKmXrQp1Wemu', 'Alice', '10th'),
('bob@test.com', '$2y$10$YQ9Rj6M5ZjK0vGwE8mN2aeXJHsNqYfMvkFdBpVcSJzKmXrQp1Wemu', 'Bob', '11th');


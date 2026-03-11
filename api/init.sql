CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) DEFAULT '',
    avatar VARCHAR(255) DEFAULT '',
    grade VARCHAR(20) DEFAULT '',
    premium_until DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    childLock INT DEFAULT NULL,
    qr_access_granted TINYINT(1) NOT NULL DEFAULT 0,
    qr_access_granted_at TIMESTAMP NULL
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

CREATE TABLE IF NOT EXISTS subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    paypal_order_id VARCHAR(50) NOT NULL,
    plan VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Streak System Database Schema

-- Stores the current streak summary for each user
CREATE TABLE IF NOT EXISTS user_streaks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_login_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Stores individual login records for detailed tracking
CREATE TABLE daily_logins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, login_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, login_date)
);

-- Stores daily time spent on the website per user
CREATE TABLE IF NOT EXISTS user_time (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    seconds INT NOT NULL DEFAULT 0,
    UNIQUE KEY unique_user_date (user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- QR master keys (physical book unlock codes)
CREATE TABLE IF NOT EXISTS qr_master_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(128) UNIQUE NOT NULL,
    used_by INT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR sticker unlocks per user
CREATE TABLE IF NOT EXISTS qr_sticker_unlocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    sticker_id INT NOT NULL,
    lesson_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_sticker (user_id, sticker_id)
);

-- Seed master QR key tokens (matches physical QR codes in qrCodes/master_qr_output/)
INSERT IGNORE INTO qr_master_keys (token) VALUES
    ('12d5758f9b734bdc0b2eb1fc9769b0dc'),
    ('2945d910c3914259e3241f57f806e3d4'),
    ('2962842418366e382daccf18454dad4c'),
    ('3861bf90ec1ec5d107c9457d913e4560'),
    ('51545682587b9a34d4d728f8ce697719'),
    ('55723e6280d00f3184f00eeaca0f09d5'),
    ('7905920aecfe0fb9af00a4bac01ae0dc'),
    ('7d63f3dcfd313b5102dd404f63964ef4'),
    ('913a3b47b9f09e6c2181a50f4df368dd'),
    ('d4c02551b2fbfb9d3382aa163a349ece');

-- Dummy test accounts (password: Password1234%)
-- Hash: $2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG
INSERT IGNORE INTO users (email, password_hash, display_name, grade, qr_access_granted, qr_access_granted_at, premium_until) VALUES
    -- No premium, no QR access
    ('test.basic@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Basic', 'Grade 1', 0, NULL, NULL),
    -- Premium only
    ('test.premium@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Premium', 'Grade 1', 0, NULL, '2099-12-31 23:59:59'),
    -- QR access only
    ('test.qr@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test QR', 'Grade 1', 1, NOW(), NULL),
    -- Premium + QR access
    ('test.both@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Both', 'Grade 1', 1, NOW(), '2099-12-31 23:59:59');


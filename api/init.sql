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
    ('d4c02551b2fbfb9d3382aa163a349ece'),
    ('570087ac392fb003d2e1b4f9e84b5b5b'),
    ('74d3408adf30445aa3bf7cd62eadf0a9'),
    ('c2dfc0078c748a69422e336e078833ef'),
    ('2e2985ca87bb1ff138003649e42e70f0'),
    ('f1281d1a6546403beb82d4d7c2a5518b'),
    ('ce621cda14ac217dd5dc60bb60463b6c'),
    ('f6cd2c05b9f8357bbbdf1e6399b1cba4'),
    ('2480ffa6bb99b027e70d144ae870d265'),
    ('cc06b8903d01c135eaef1672a8cfc336'),
    ('6a84eddcebd1fe2bd3d62786798754d2'),
    ('e79e3281b96d59483939248d5a7cef04'),
    ('8555f97ced6197fbdf680c0d33e2c2af'),
    ('60e22b000a4daca09b0f97bba02e2e7d'),
    ('b199267b9efa56f3f58e65b845577170'),
    ('f1ad175f97d4ada111bcce8173cc0fc0'),
    ('a00e0ebcb19aff188948029280fabd42'),
    ('a46709293e84b96655fede5faa6fecf7'),
    ('35d376d2aac3ca7726b75f11c1a52aa3'),
    ('eee21d1271b6d238144fa40795591ed0'),
    ('ca281533b62bb0d6b2a664c886488822'),
    ('c1e532ef2c54d23dc0d94c1a64168630'),
    ('0ebf5264fb05a89adf45ddc1907cf741'),
    ('2ba4aa47186055dc49f8aa61ddea6378'),
    ('f232333e5b6077285cc81a9bb49f65a3'),
    ('6c3fcdc5bd696fb75faf172f23cc8bc3'),
    ('c8d8d6d5e1e4240e2e9c0541249ef789'),
    ('0b3f93f8e84e474919fd306763c5cf31'),
    ('30e5c1b7562d7b0f1ec551196981411b'),
    ('624c59c27de7609ef33071ddd5ca83d2'),
    ('62124ae8c6acd14db5403a6b5edb490a'),
    ('3878664b7bc1aee5ca56a24d418b1057'),
    ('fbd29d4472f508e32dc593bd4b39325d'),
    ('11b279a7a62b879c35c2d29cf7e464da'),
    ('be47d5e69f12d0929c34594810b7168c'),
    ('278459b6d45fdd88f6e43581db49a70c'),
    ('d7397c6fe062604921ba9f1be30d2010'),
    ('6731478fad277fe71d6b1ee38147b553'),
    ('afda1f805c5e7f77196798d1f12fe273'),
    ('01eb36cc6f63318da9173d4467cebcca'),
    ('84c7e95e755b737b468bae39c12da1da');


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
    ('test.both@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Both', 'Grade 1', 1, NOW(), '2099-12-31 23:59:59'),
    -- Grade 2, no premium, no QR
    ('test.grade2@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Grade2', 'Grade 2', 0, NULL, NULL),
    -- Grade 3, premium only
    ('test.grade3@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Grade3', 'Grade 3', 0, NULL, '2099-12-31 23:59:59'),
    -- Grade 4, QR access only
    ('test.grade4@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Grade4', 'Grade 4', 1, NOW(), NULL),
    -- Grade 5, premium + QR
    ('test.grade5@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Grade5', 'Grade 5', 1, NOW(), '2099-12-31 23:59:59'),
    -- Grade 6, no premium, no QR
    ('test.grade6@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Grade6', 'Grade 6', 0, NULL, NULL),
    -- Expired premium
    ('test.expired@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test Expired', 'Grade 1', 0, NULL, '2020-01-01 00:00:00'),
    -- Child lock enabled
    ('test.childlock@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', 'Test ChildLock', 'Grade 2', 0, NULL, NULL),
        -- No display name set
    ('test.nodisplay@arco.com', '$2y$10$6KcxvNw7eq6NOxnpNQ2rbuw7H/mzgWO0cvuuEZeS.X0YFJ/mbZ8pG', '', 'Grade 1', 0, NULL, NULL);

-- Set child lock on the childlock test account
UPDATE users SET childLock = 1234 WHERE email = 'test.childlock@arco.com';


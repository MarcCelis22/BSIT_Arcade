-- 1. Create USERS Table
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Student', 'Developer', 'Faculty')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create CATEGORIES Table
CREATE TABLE categories (
    category_id VARCHAR(36) PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 3. Create GAMES Table
CREATE TABLE games (
    game_id VARCHAR(36) PRIMARY KEY,
    developer_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    title VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_game_developer FOREIGN KEY (developer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_game_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);

-- 4. Create GAME_VERSIONS Table
CREATE TABLE game_versions (
    version_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    version_number VARCHAR(20) NOT NULL,
    download_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_version_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT uq_game_version UNIQUE (game_id, version_number)
);

-- 5. Create REVIEWS Table
CREATE TABLE reviews (
    review_id VARCHAR(36) PRIMARY KEY,
    game_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    rating NUMERIC(3,2) NOT NULL CHECK (rating >= 1.00 AND rating <= 5.00),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_game FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_game_review UNIQUE (user_id, game_id)
);

-- 6. Create GAME_SESSIONS Table
CREATE TABLE game_sessions (
    session_id VARCHAR(36) PRIMARY KEY,
    version_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    score INT DEFAULT 0,
    play_time_minutes NUMERIC(6,2) NOT NULL CHECK (play_time_minutes >= 0.00),
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session_version FOREIGN KEY (version_id) REFERENCES game_versions(version_id) ON DELETE CASCADE,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 7. Performance Indexes
CREATE INDEX idx_game_versions_game_id ON game_versions(game_id);
CREATE INDEX idx_game_sessions_version_user ON game_sessions(version_id, user_id);

ALTER TABLE articles ADD INDEX idx_location (city, state);
ALTER TABLE articles ADD INDEX idx_newspaper (newspaper);

CREATE UNIQUE INDEX idx_name_email
ON users(username, email);


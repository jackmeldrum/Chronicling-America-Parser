CREATE TABLE OCR_edits
(
	edit_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL REFERENCES users(user_id),
    article_url VARCHAR(255) NOT NULL REFERENCES articles(article_url),
    old_text TEXT NOT NULL,
    new_text TEXT NOT NULL,
    date_suggested DATETIME,
    date_approved DATETIME,
    PRIMARY KEY(edit_id),
    FOREIGN KEY(user_id)
	REFERENCES users(user_id)
		ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

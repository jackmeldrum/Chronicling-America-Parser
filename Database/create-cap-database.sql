CREATE TABLE articles
(
    article_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255),
    article_text TEXT NOT NULL,
    newspaper VARCHAR(255),
    publisher VARCHAR(255),
    publish_date DATETIME,
    city VARCHAR(30),
    state VARCHAR(15),
    latitude VARCHAR(20),
    longitude VARCHAR(20),
    article_url VARCHAR(255) NOT NULL,
    date_created DATETIME,
    date_updated DATETIME,
    PRIMARY KEY(article_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE users
(
    user_id INT NOT NULL AUTO_INCREMENT,
    password VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    date_created DATETIME,
    date_updated DATETIME,
    isMod BOOLEAN NOT NULL DEFAULT 0,
    isAdmin BOOLEAN NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id),
    UNIQUE (email)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE queries
(
    query_id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    query_name VARCHAR(255),
    query_content VARCHAR(255),
    date_created DATETIME,
    date_updated DATETIME,
    PRIMARY KEY (query_id),
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
		ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE batches
(
    batch_id INT NOT NULL AUTO_INCREMENT,
    batch_name VARCHAR(255),
    is_uploaded BOOLEAN,
    date_uploaded DATETIME,
    PRIMARY KEY (batch_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;



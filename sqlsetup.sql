CREATE TABLE user_profile
(
    discord_id      VARCHAR(32) NOT NULL,
    blurb           VARCHAR(1000),
    coins           BIGINT(20) DEFAULT 0,
    hearts          BIGINT(20) DEFAULT 0,
    daily_streak    BIGINT(20) DEFAULT 0,
    daily_last      BIGINT(20) DEFAULT 0,
    hearts_last     BIGINT(20) DEFAULT 0,
    heart_box_last  BIGINT(20) DEFAULT 0,
    last_orphan     BIGINT(20) DEFAULT 0,
    mission_last    BIGINT(20) DEFAULT 0,
    PRIMARY KEY (discord_id)
);

CREATE TABLE serial_number
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    serial_number   INT(11) DEFAULT 0,
    PRIMARY KEY (id)
);

CREATE TABLE pack_text
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    font            VARCHAR(255) DEFAULT "Impact",
    size            INT(11) DEFAULT 25,
    color           VARCHAR(255) DEFAULT "white",
    align           VARCHAR(255) DEFAULT "left",
    x               INT(11) DEFAULT 25,
    y               INT(11) DEFAULT 100,
    PRIMARY KEY (id)
);

CREATE TABLE member_text
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    font            VARCHAR(255) DEFAULT "Impact",
    size            INT(11) DEFAULT 25,
    color           VARCHAR(255) DEFAULT "white",
    align           VARCHAR(255) DEFAULT "left",
    x               INT(11) DEFAULT 25,
    y               INT(11) DEFAULT 100,
    PRIMARY KEY (id)
);

CREATE TABLE serial_text
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    font            VARCHAR(255) DEFAULT "Impact",
    size            INT(11) DEFAULT 25,
    color           VARCHAR(255) DEFAULT "white",
    align           VARCHAR(255) DEFAULT "left",
    x               INT(11) DEFAULT 25,
    y               INT(11) DEFAULT 100,
    PRIMARY KEY (id)
);

CREATE TABLE level_text
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    font            VARCHAR(255) DEFAULT "Impact",
    size            INT(11) DEFAULT 25,
    color           VARCHAR(255) DEFAULT "white",
    align           VARCHAR(255) DEFAULT "left",
    x               INT(11) DEFAULT 25,
    y               INT(11) DEFAULT 100,
    PRIMARY KEY (id)
);

CREATE TABLE level_num
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    font            VARCHAR(255) DEFAULT "Impact",
    size            INT(11) DEFAULT 25,
    color           VARCHAR(255) DEFAULT "white",
    align           VARCHAR(255) DEFAULT "left",
    x               INT(11) DEFAULT 25,
    y               INT(11) DEFAULT 100,
    PRIMARY KEY (id)
);

CREATE TABLE heart_text
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    font            VARCHAR(255) DEFAULT "Impact",
    size            INT(11) DEFAULT 25,
    color           VARCHAR(255) DEFAULT "white",
    align           VARCHAR(255) DEFAULT "left",
    x               INT(11) DEFAULT 25,
    y               INT(11) DEFAULT 100,
    PRIMARY KEY (id)
);

CREATE TABLE image_data
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    heart_image_url VARCHAR(255),
    heart_x         INT(11),
    heart_y         INT(11),
    heart_length    INT(11),
    heart_height    INT(11),
    star_image_url  VARCHAR(255),
    star_starting_x INT(11),
    star_starting_y INT(11),
    star_height     INT(11),
    star_length     INT(11),
    star_x_inc      INT(11),
    star_y_inc      INT(11),
    pack_text_id    INT(11), 
    member_text_id  INT(11),
    serial_text_id  INT(11),
    level_text_id   INT(11),
    level_num_id    INT(11),
    heart_text_id   INT(11),
    PRIMARY KEY (id), 
    CONSTRAINT PackText FOREIGN KEY (pack_text_id) REFERENCES pack_text(id) ON DELETE CASCADE,
    CONSTRAINT MemberText FOREIGN KEY (member_text_id) REFERENCES member_text(id) ON DELETE CASCADE,
    CONSTRAINT SerialText FOREIGN KEY (serial_text_id) REFERENCES serial_text(id) ON DELETE CASCADE,
    CONSTRAINT LevelText FOREIGN KEY (level_text_id) REFERENCES level_text(id) ON DELETE CASCADE,
    CONSTRAINT LevelNum FOREIGN KEY (level_num_id) REFERENCES level_num(id) ON DELETE CASCADE,
    CONSTRAINT HeartText FOREIGN KEY (heart_text_id) REFERENCES heart_text(id) ON DELETE CASCADE
);

CREATE TABLE pack
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255),
    image_data_id   INT(11),
    PRIMARY KEY (id),
    CONSTRAINT ImageData FOREIGN KEY (image_data_id) REFERENCES image_data (id) ON DELETE CASCADE
);

CREATE TABLE card
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    blurb           VARCHAR(255),
    member          VARCHAR(255),
    credit          VARCHAR(255),
    abbreviation    VARCHAR(255),
    rarity          INT(11) DEFAULT 5,
    image_url       VARCHAR(255),
    pack_id         INT(11),
    serial_id       INT(11),
    PRIMARY KEY (id),
    CONSTRAINT Pack FOREIGN KEY (pack_id) REFERENCES pack (id) ON DELETE CASCADE,
    CONSTRAINT SerialNumber FOREIGN KEY (serial_id) REFERENCES serial_number (id) ON DELETE CASCADE
);

CREATE TABLE shop
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255),
    price           INT(11) DEFAULT 0,
    active          BOOLEAN DEFAULT TRUE,
    pack_id         INT(11),
    PRIMARY KEY (id),
    CONSTRAINT PackShop FOREIGN KEY (pack_id) REFERENCES pack (id) ON DELETE CASCADE
);

CREATE TABLE user_card
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    serial_number   INT(11),
    owner_id        VARCHAR(32),
    stars           INT(11),
    hearts          INT(11),
    card_id         INT(11),
    PRIMARY KEY (id),
    CONSTRAINT Card FOREIGN KEY (card_id) REFERENCES card (id) ON DELETE CASCADE,
    CONSTRAINT UC_UserCard UNIQUE (serial_number, card_id)
);

CREATE TABLE friend
(
    relationship_id INT(11) NOT NULL AUTO_INCREMENT,
    user_id         VARCHAR(32),
    friend_id       VARCHAR(32),
    PRIMARY KEY (relationship_id),
    CONSTRAINT FriendUser FOREIGN KEY (user_id) REFERENCES user_profile (discord_id) ON DELETE CASCADE,
    CONSTRAINT Friend FOREIGN KEY (friend_id) REFERENCES user_profile (discord_id) ON DELETE CASCADE
);

CREATE TABLE badge
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255),
    blurb           VARCHAR(255),
    emoji           VARCHAR(255),
    PRIMARY KEY (id)
);

CREATE TABLE user_badge
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    discord_id      VARCHAR(32) NOT NULL,
    badge_id        INT(11) NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT UserBadge FOREIGN KEY (discord_id) REFERENCES user_profile (discord_id) ON DELETE CASCADE,
    CONSTRAINT BadgeOnUser FOREIGN KEY (badge_id) REFERENCES badge (id) ON DELETE CASCADE
);

CREATE TABLE marketplace
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    card_id         INT(11) NOT NULL,
    price           INT(11) NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT MarketplaceCard FOREIGN KEY (card_id) REFERENCES user_card (id) ON DELETE CASCADE
);

CREATE TABLE trade_request
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    unique_id       VARCHAR(255) NOT NULL,
    sender_id       VARCHAR(32) NOT NULL,
    recipient_id    VARCHAR(32) NOT NULL,
    sender_card     INT(11),
    recipient_card  INT(11),
    PRIMARY KEY(id),
    CONSTRAINT TradeSender FOREIGN KEY (sender_id) REFERENCES user_profile (discord_id) ON DELETE CASCADE,
    CONSTRAINT TradeRecipient FOREIGN KEY (recipient_id) REFERENCES user_profile (discord_id) ON DELETE CASCADE
);

CREATE TABLE stats
(
    statistic_name  VARCHAR(255) NOT NULL,
    statistic_count INT(11) DEFAULT 0
);

INSERT INTO stats (statistic_name) VALUES ("trivia_correct");
INSERT INTO stats (statistic_name) VALUES ("trivia_wrong");
INSERT INTO stats (statistic_name) VALUES ("trades_complete");
INSERT INTO stats (statistic_name) VALUES ("market_sales");

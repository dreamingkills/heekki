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
    xp              BIGINT(20) DEFAULT 0,
    PRIMARY KEY (discord_id)
);

CREATE TABLE serial_number
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    serial_number   INT(11) DEFAULT 0,
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
    star_image_url  VARCHAR(255),
    star_starting_x INT(11),
    star_starting_y INT(11),
    star_height     INT(11),
    star_length     INT(11),
    star_x_inc      INT(11),
    star_y_inc      INT(11),
    serial_text_id  INT(11),
    level_num_id    INT(11),
    heart_text_id   INT(11),
    PRIMARY KEY (id), 
    CONSTRAINT SerialText FOREIGN KEY (serial_text_id) REFERENCES serial_text(id) ON DELETE CASCADE,
    CONSTRAINT LevelNum FOREIGN KEY (level_num_id) REFERENCES level_num(id) ON DELETE CASCADE,
    CONSTRAINT HeartText FOREIGN KEY (heart_text_id) REFERENCES heart_text(id) ON DELETE CASCADE
);

CREATE TABLE pack
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255),
    credit          VARCHAR(255),
    cover_url       VARCHAR(255),
    flavor_text     VARCHAR(255),
    image_data_id   INT(11),
    PRIMARY KEY (id),
    CONSTRAINT ImageData FOREIGN KEY (image_data_id) REFERENCES image_data (id) ON DELETE CASCADE
);

CREATE TABLE card
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    blurb           VARCHAR(255),
    member          VARCHAR(255),
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
    is_favorite     BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT Card FOREIGN KEY (card_id) REFERENCES card (id) ON DELETE CASCADE,
    CONSTRAINT UC_UserCard UNIQUE (serial_number, card_id)
);

CREATE TABLE friend
(
    relationship_id INT(11) NOT NULL AUTO_INCREMENT,
    sender_id       VARCHAR(32),
    friend_id       VARCHAR(32),
    confirmed       BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (relationship_id)
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

CREATE TABLE trivia
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    discord_id      VARCHAR(32) NOT NULL,
    correct         BOOLEAN NOT NULL,
    time            BIGINT(20) NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT TriviaCompleter FOREIGN KEY (discord_id) REFERENCES user_profile (discord_id) ON DELETE CASCADE
);

CREATE TABLE sale
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    buyer_id        VARCHAR(32) NOT NULL,
    seller_id       VARCHAR(32) NOT NULL,
    time            BIGINT(20) NOT NULL,
    card            VARCHAR(32) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE trade
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    sender_id       VARCHAR(32) NOT NULL,
    receiver_id     VARCHAR(32) NOT NULL,
    time            BIGINT(20) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE fish
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    owner_id        VARCHAR(32) NOT NULL,
    fish_id         INT(11) NOT NULL,
    fish_weight     DOUBLE(11, 4) NOT NULL,
    weight_mod      INT(11) NOT NULL,
    identifier      VARCHAR(32) NOT NULL,
    trophy_fish     BOOLEAN DEFAULT FALSE,
    CONSTRAINT FishIdentifier UNIQUE(identifier),
    PRIMARY KEY(id)
);

CREATE TABLE mission
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    discord_id      VARCHAR(32) NOT NULL,
    success         BOOLEAN,
    time            BIGINT(20) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE reputation
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    receiver_id     VARCHAR(32) NOT NULL,
    sender_id       VARCHAR(32) NOT NULL,
    PRIMARY KEY(id),
    CONSTRAINT UniqueRep UNIQUE(receiver_id, sender_id)
);

CREATE TABLE friend_heart
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    sender_id       VARCHAR(32) NOT NULL,
    friend_id       VARCHAR(32) NOT NULL,
    time            BIGINT(20) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE fish_types
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    fish_name       VARCHAR(255) NOT NULL,
    base_chance     INT(11) NOT NULL,
    fish_weight     DOUBLE(11, 4) NOT NULL,
    emoji           VARCHAR(255) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE weight_mod
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    mod_name        VARCHAR(255) NOT NULL,
    multiplier      DOUBLE(11, 4) NOT NULL,
    base_chance     INT(11) NOT NULL,
    price_multiplier INT(11) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE supporter
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    supporter_name  VARCHAR(255) NOT NULL,
    discord_id      VARCHAR(32) NOT NULL,
    PRIMARY KEY(id)
);

ALTER TABLE user_profile ADD COLUMN use_card INT(11) DEFAULT 0;

CREATE TABLE setting 
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    guild_id        TINYTEXT NOT NULL,
    name            TINYTEXT NOT NULL,
    value           TINYTEXT,
    PRIMARY KEY(id)
);

ALTER TABLE user_profile ADD COLUMN shards INT(11) DEFAULT 0;
ALTER TABLE user_profile DROP COLUMN xp;
ALTER TABLE user_profile CHANGE COLUMN mission_last mission_next BIGINT(20);

CREATE TABLE guild
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    guild_id        TINYTEXT NOT NULL,
    drop_channel    TINYTEXT NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE eden
(
    id              INT(11) NOT NULL AUTO_INCREMENT,
    discord_id      TINYTEXT NOT NULL,
    cash            INT(11) DEFAULT 0,
    hourly_rate     INT(11) DEFAULT 0,
    cap             INT(11) DEFAULT 150,
    multiplier      DECIMAL(11, 1) DEFAULT 1,
    multiplier_ends BIGINT(20),
    heejin          INT(11),
    hyunjin         INT(11),
    haseul          INT(11),
    yeojin          INT(11),
    vivi            INT(11),
    kimlip          INT(11),
    jinsoul         INT(11),
    choerry         INT(11),
    yves            INT(11),
    chuu            INT(11),
    gowon           INT(11),
    oliviahye       INT(11),
    PRIMARY KEY(id)
);

ALTER TABLE card DROP FOREIGN KEY SerialNumber;
ALTER TABLE card DROP COLUMN serial_id;
DROP TABLE serial_number;
ALTER TABLE card ADD COLUMN serial_total INT(11) DEFAULT 0;
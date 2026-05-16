-- 3D盲盒平台 · 数据库初始化脚本
-- 首次部署时由 docker-compose 自动执行

CREATE DATABASE IF NOT EXISTS blindbox DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE blindbox;

-- 用户表
CREATE TABLE IF NOT EXISTS t_user (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    phone           VARCHAR(20)  NOT NULL DEFAULT '',
    wechat_openid   VARCHAR(64)  NOT NULL DEFAULT '',
    nickname        VARCHAR(32)  NOT NULL DEFAULT '',
    avatar_url      VARCHAR(256) NOT NULL DEFAULT '',
    level           INT          NOT NULL DEFAULT 1,
    exp             BIGINT       NOT NULL DEFAULT 0,
    status          TINYINT      NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_phone (phone),
    UNIQUE KEY uk_openid (wechat_openid),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 虚拟币钱包
CREATE TABLE IF NOT EXISTS t_wallet (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT       NOT NULL,
    balance         BIGINT       NOT NULL DEFAULT 0,
    total_recharge  BIGINT       NOT NULL DEFAULT 0,
    total_spent     BIGINT       NOT NULL DEFAULT 0,
    frozen_balance  BIGINT       NOT NULL DEFAULT 0,
    version         INT          NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 盲盒系列
CREATE TABLE IF NOT EXISTS t_box_series (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(64)  NOT NULL,
    cover_url       VARCHAR(256) NOT NULL DEFAULT '',
    description     VARCHAR(512) NOT NULL DEFAULT '',
    price           BIGINT       NOT NULL,
    total_items     INT          NOT NULL,
    status          TINYINT      NOT NULL DEFAULT 1,
    sort_order      INT          NOT NULL DEFAULT 0,
    is_hot          TINYINT      NOT NULL DEFAULT 0,
    is_new          TINYINT      NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_status_sort (status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 藏品定义
CREATE TABLE IF NOT EXISTS t_item_def (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    series_id       BIGINT       NOT NULL,
    name            VARCHAR(64)  NOT NULL,
    model_url       VARCHAR(256) NOT NULL,
    thumbnail_url   VARCHAR(256) NOT NULL DEFAULT '',
    rarity          TINYINT      NOT NULL,
    probability     DECIMAL(6,4) NOT NULL,
    sort_order      INT          NOT NULL DEFAULT 0,
    status          TINYINT      NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_series (series_id),
    KEY idx_rarity (rarity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 开盒记录
CREATE TABLE IF NOT EXISTS t_draw_record (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    draw_no         VARCHAR(64)  NOT NULL,
    user_id         BIGINT       NOT NULL,
    series_id       BIGINT       NOT NULL,
    item_id         BIGINT       NOT NULL,
    item_name       VARCHAR(64)  NOT NULL,
    rarity          TINYINT      NOT NULL,
    price           BIGINT       NOT NULL,
    is_first_get    TINYINT      NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_created (user_id, created_at),
    KEY idx_series (series_id),
    UNIQUE KEY uk_draw_no (draw_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 用户藏品
CREATE TABLE IF NOT EXISTS t_user_item (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT       NOT NULL,
    item_id         BIGINT       NOT NULL,
    series_id       BIGINT       NOT NULL,
    quantity        INT          NOT NULL DEFAULT 1,
    first_get_at    DATETIME     NOT NULL,
    latest_get_at   DATETIME     NOT NULL,
    is_displayed    TINYINT      NOT NULL DEFAULT 0,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_item (user_id, item_id),
    KEY idx_user_series (user_id, series_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 交易流水
CREATE TABLE IF NOT EXISTS t_transaction (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    trans_no        VARCHAR(64)  NOT NULL,
    user_id         BIGINT       NOT NULL,
    type            TINYINT      NOT NULL,
    amount          BIGINT       NOT NULL,
    balance_before  BIGINT       NOT NULL,
    balance_after   BIGINT       NOT NULL,
    biz_id          BIGINT       NOT NULL DEFAULT 0,
    remark          VARCHAR(128) NOT NULL DEFAULT '',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_user_created (user_id, created_at),
    UNIQUE KEY uk_trans_no (trans_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 社交动态
CREATE TABLE IF NOT EXISTS t_feed (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT       NOT NULL,
    draw_record_id  BIGINT       NOT NULL,
    content         VARCHAR(256) NOT NULL DEFAULT '',
    image_url       VARCHAR(256) NOT NULL DEFAULT '',
    like_count      INT          NOT NULL DEFAULT 0,
    comment_count   INT          NOT NULL DEFAULT 0,
    status          TINYINT      NOT NULL DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_created (status, created_at),
    KEY idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

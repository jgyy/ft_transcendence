CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) NOT NULL UNIQUE,
    username_42 VARCHAR(150) UNIQUE,
    password VARCHAR(128) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'avatars/storm-trooper.png',
    active_at TIMESTAMP WITH TIME ZONE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    email VARCHAR(254)
);

CREATE TABLE user_friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
);

CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    winner_alias VARCHAR(255),
    winner_username VARCHAR(255),
    max_players INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('waiting', 'started', 'over')) DEFAULT 'waiting',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
    tournament_round INTEGER,
    key VARCHAR(255) NOT NULL,
    winner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    winner_alias VARCHAR(255),
    winner_username VARCHAR(255),
    player_1_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    player_1_alias VARCHAR(255),
    player_1_username VARCHAR(255),
    player_1_score INTEGER DEFAULT 0,
    player_2_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    player_2_alias VARCHAR(255),
    player_2_username VARCHAR(255),
    player_2_score INTEGER DEFAULT 0,
    winning_score INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('created', 'waiting', 'started', 'paused', 'over')) DEFAULT 'created',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

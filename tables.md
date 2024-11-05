# Tables

1. User Management Tables:
```sql
users
- id (primary key)
- username (unique)
- display_name
- email (unique)
- hashed_password
- avatar_url
- status (online/offline/in_game)
- two_factor_enabled (boolean)
- created_at
- updated_at

oauth_accounts
- id (primary key)
- user_id (foreign key to users)
- provider (e.g., '42')
- provider_user_id
- created_at

friends
- id (primary key)
- user_id (foreign key to users)
- friend_id (foreign key to users)
- status (pending/accepted/blocked)
- created_at
```

2. Game/Match History Tables:
```sql
matches
- id (primary key)
- status (ongoing/completed)
- game_type (pong/other_game)
- created_at
- ended_at
- tournament_id (foreign key to tournaments, nullable)

match_players
- id (primary key)
- match_id (foreign key to matches)
- user_id (foreign key to users)
- score
- position (player1/player2)
- winner (boolean)

game_stats
- id (primary key)
- user_id (foreign key to users)
- total_matches
- wins
- losses
- win_streak
- last_played
- updated_at
```

3. Tournament Tables:
```sql
tournaments
- id (primary key)
- name
- status (pending/ongoing/completed)
- created_at
- ended_at

tournament_players
- id (primary key)
- tournament_id (foreign key to tournaments)
- user_id (foreign key to users)
- position
- status (active/eliminated)
- created_at
```

4. Chat System Tables:
```sql
chat_rooms
- id (primary key)
- name
- type (direct/tournament)
- created_at

chat_participants
- id (primary key)
- chat_room_id (foreign key to chat_rooms)
- user_id (foreign key to users)
- created_at

messages
- id (primary key)
- chat_room_id (foreign key to chat_rooms)
- user_id (foreign key to users)
- content
- created_at

blocked_users
- id (primary key)
- user_id (foreign key to users)
- blocked_user_id (foreign key to users)
- created_at
```

5. Game Customization Tables
```sql
game_settings
- id (primary key)
- user_id (foreign key to users)
- power_ups_enabled (boolean)
- custom_map
- paddle_speed
- ball_speed
- created_at
- updated_at
```

6. Achievement/Stats Tables:
```sql
achievements
- id (primary key)
- name
- description
- criteria
- created_at

user_achievements
- id (primary key)
- user_id (foreign key to users)
- achievement_id (foreign key to achievements)
- unlocked_at
```

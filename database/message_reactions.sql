CREATE TABLE IF NOT EXISTS goldenmessages.message_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES goldenmessages.messages(id) ON DELETE CASCADE,
    reaction_type VARCHAR(30) NOT NULL,
    viewer_name VARCHAR(120),
    comment TEXT,
    ip_address TEXT,
    user_agent TEXT,
    viewer_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT message_reactions_type_check
        CHECK (reaction_type IN ('like', 'love', 'smile', 'clap', 'star')),
    CONSTRAINT message_reactions_one_per_viewer
        UNIQUE (message_id, viewer_hash)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id
    ON goldenmessages.message_reactions(message_id);

CREATE INDEX IF NOT EXISTS idx_message_reactions_reaction_type
    ON goldenmessages.message_reactions(reaction_type);

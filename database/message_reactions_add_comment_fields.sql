ALTER TABLE goldenmessages.message_reactions
    ADD COLUMN IF NOT EXISTS viewer_name VARCHAR(120),
    ADD COLUMN IF NOT EXISTS comment TEXT;

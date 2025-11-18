-- Add display_link field to classes table
ALTER TABLE classes
ADD COLUMN display_link TEXT;

-- Add comment
COMMENT ON COLUMN classes.display_link IS 'Link to display/scoreboard page for live/past show videos';

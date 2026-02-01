-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own todos
CREATE POLICY "Users can view their own todos"
  ON todos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own todos
CREATE POLICY "Users can insert their own todos"
  ON todos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own todos
CREATE POLICY "Users can update their own todos"
  ON todos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can delete their own todos
CREATE POLICY "Users can delete their own todos"
  ON todos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);
CREATE INDEX IF NOT EXISTS todos_completed_idx ON todos(completed);
CREATE INDEX IF NOT EXISTS todos_created_at_idx ON todos(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for todos table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE todos;

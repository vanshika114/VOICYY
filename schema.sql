-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Create forms table
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_forms_user_id ON forms(user_id);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'voice' CHECK (type IN ('voice', 'text')),
  is_required BOOLEAN DEFAULT FALSE,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_questions_form_id ON questions(form_id);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_responses_form_id ON responses(form_id);

-- Create answers table
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id),
  answer_type TEXT NOT NULL CHECK (answer_type IN ('voice', 'text')),
  text_content TEXT,
  audio_url TEXT,
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_answers_response_id ON answers(response_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can see own record"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- RLS Policies for forms table
CREATE POLICY "Users can see own forms"
  ON forms FOR SELECT
  USING (user_id = auth.uid() OR is_published = TRUE);

CREATE POLICY "Users can create forms"
  ON forms FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own forms"
  ON forms FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own forms"
  ON forms FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for questions table
CREATE POLICY "Anyone can read questions from published forms"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = questions.form_id
      AND (forms.is_published = TRUE OR forms.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage own form questions"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own form questions"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own form questions"
  ON questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_id
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for responses table
CREATE POLICY "Anyone can create responses to published forms"
  ON responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_id
      AND forms.is_published = TRUE
    )
  );

CREATE POLICY "Creators can read own form responses"
  ON responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_id
      AND forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can delete own responses"
  ON responses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM forms
      WHERE forms.id = form_id
      AND forms.user_id = auth.uid()
    )
  );

-- RLS Policies for answers table
CREATE POLICY "Anyone can create answers"
  ON answers FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Creators can read own form answers"
  ON answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM responses
      JOIN forms ON forms.id = responses.form_id
      WHERE responses.id = response_id
      AND forms.user_id = auth.uid()
    )
  );
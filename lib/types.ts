export interface Form {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  form_id: string;
  text: string;
  type: 'voice' | 'text';
  is_required: boolean;
  order_index: number;
  created_at: string;
}

export interface Response {
  id: string;
  form_id: string;
  created_at: string;
}

export interface Answer {
  id: string;
  response_id: string;
  question_id: string;
  answer_type: 'voice' | 'text';
  text_content: string | null;
  audio_url: string | null;
  duration_seconds: number | null;
  created_at: string;
}
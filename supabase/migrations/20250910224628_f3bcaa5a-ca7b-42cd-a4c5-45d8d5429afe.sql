-- Create profile for existing user
INSERT INTO public.profiles (user_id, email, nome, plano, trial_end_date)
VALUES (
  '9f829890-4197-410b-848d-206cfeed72fe',
  'prokiki.pedro@gmail.com',
  'Pedro',
  'trial',
  now() + interval '7 days'
)
ON CONFLICT (user_id) DO UPDATE SET
  plano = EXCLUDED.plano,
  trial_end_date = EXCLUDED.trial_end_date;
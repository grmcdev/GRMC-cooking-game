-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Process GRMC → Chef swaps every 2 minutes
SELECT cron.schedule(
  'process-grmc-to-chef-swaps',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mmmnghihshsjuawwcplj.supabase.co/functions/v1/process-grmc-to-chef-swaps',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-swap-secret', current_setting('app.settings.swap_processor_secret', true)
    ),
    body := jsonb_build_object('time', now())
  );
  $$
);

-- Process Chef → GRMC swaps every 2 minutes
SELECT cron.schedule(
  'process-chef-to-grmc-swaps',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://mmmnghihshsjuawwcplj.supabase.co/functions/v1/process-chef-to-grmc-swaps',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-swap-secret', current_setting('app.settings.swap_processor_secret', true)
    ),
    body := jsonb_build_object('time', now())
  );
  $$
);
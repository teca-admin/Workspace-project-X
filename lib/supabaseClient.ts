import { createClient } from '@supabase/supabase-js';

// Configurações do novo banco de dados fornecido pelo usuário
const supabaseUrl = 'https://varhasburmvihwkhlhtz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmhhc2J1cm12aWh3a2hsaHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzU0NzMsImV4cCI6MjA4MzIxMTQ3M30.LBsLWAytsCLyvcq883OfH2uUXt1DS1j4ECxzaBQGmes';

export const supabase = createClient(supabaseUrl, supabaseKey);

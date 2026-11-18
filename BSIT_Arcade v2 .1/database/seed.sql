-- Sample Seed Data
-- Passwords belong to Supabase Auth (auth.users), not public.users.
-- Do not add password or password_hash columns to public.users.
INSERT INTO users (user_id, user_name, email, role) VALUES 
('usr001', 'Marc Celis', 'marc.celis@bsit.edu', 'Developer'),
('usr002', 'Charles Martillano', 'charles.martillano@bsit.edu', 'Developer'),
('usr003', 'Paul Dela Vega', 'paul.dela.vega@bsit.edu', 'Student'),
('usr004', 'Larry Vivero', 'larry.vivero@bsit.edu', 'Student'),
('usr005', 'Prof. Joni Capucao', 'joni.capucao@bsit.edu', 'Faculty');

INSERT INTO categories (category_id, category_name, description) VALUES 
('cat001', 'Multiplayer (LAN)', 'Games designed for local network connectivity over Wi-Fi or LAN.'),
('cat002', 'Action / Arcade', 'Fast-paced standalone games designed for casual single-player playthroughs.'),
('cat003', 'RPG / Adventure', 'Narrative-driven, explorer-focused standalone offline titles.');

-- Enable row-level security before adding the policies below.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Public Read & Insert Policies for BSIT Arcade Web Client
CREATE POLICY "Public Read Users" ON users FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create own profile" ON users
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Public Read Categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public Read Games" ON games FOR SELECT USING (true);
CREATE POLICY "Public Insert Games" ON games FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Versions" ON game_versions FOR SELECT USING (true);
CREATE POLICY "Public Insert Versions" ON game_versions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Sessions" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "Public Insert Sessions" ON game_sessions FOR INSERT WITH CHECK (true);

-- Task 4 Analytical Query
SELECT 
    g.title AS game_title,
    gv.version_number,
    COUNT(gs.session_id) AS total_gameplay_sessions,
    SUM(gs.play_time_minutes) AS aggregate_play_minutes
FROM games g
JOIN game_versions gv ON g.game_id = gv.game_id
JOIN game_sessions gs ON gv.version_id = gs.version_id
GROUP BY g.game_id, g.title, gv.version_id, gv.version_number
ORDER BY aggregate_play_minutes DESC;

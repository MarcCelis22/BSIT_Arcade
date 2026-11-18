// ---------------------------------------------------------------------
        // 1. STATE & 6-TABLE RELATIONAL SCHEMA DATA STORE
        // ---------------------------------------------------------------------
        let supabaseClient = null;
        let isLiveMode = false;
        let activeCategoryFilter = 'ALL';
        let activeUserId = 'usr001';
        let currentAuthUser = null;
        let isDemoSession = false;
        let isLocalAccountSession = false;
        let authBackend = 'local';
        let localAccounts = [];
        let authMode = 'signin';
        let currentDetailGameId = null;
        let publishMode = 'new_game';

        // Live Session Timer State
        let timerInterval = null;
        let timerSeconds = 0;

        // Pre-populated Realistic BSIT Arcade Dataset (Matches 6 PostgreSQL Tables)
        const dbState = {
            users: [
                { user_id: 'usr001', user_name: 'Carl Sanchez', email: 'carl.sanchez@bsit.edu', role: 'Developer', created_at: '2026-09-01T08:00:00Z' },
                { user_id: 'usr002', user_name: 'Maverick Cruz', email: 'maverick.cruz@bsit.edu', role: 'Student', created_at: '2026-09-02T09:15:00Z' },
                { user_id: 'usr003', user_name: 'Prof. Angela Santos', email: 'angela.santos@bsit.edu', role: 'Faculty', created_at: '2026-09-03T10:30:00Z' },
                { user_id: 'usr004', user_name: 'Bea Mendoza', email: 'bea.mendoza@bsit.edu', role: 'Developer', created_at: '2026-09-04T11:20:00Z' }
            ],
            categories: [
                { category_id: 'cat001', category_name: 'Multiplayer (LAN)', description: 'Games designed for local network connectivity over Wi-Fi or lab LAN.' },
                { category_id: 'cat002', category_name: 'Action / Arcade', description: 'Fast-paced standalone desktop & mobile games for offline playthroughs.' },
                { category_id: 'cat003', category_name: 'RPG / Adventure', description: 'Narrative-driven, explorer-focused standalone offline student capstone titles.' }
            ],
            games: [
                { game_id: 'gam001', developer_id: 'usr001', category_id: 'cat001', title: 'Lab Shooter: Local Wi-Fi Edition', created_at: '2026-10-10T10:00:00Z' },
                { game_id: 'gam002', developer_id: 'usr001', category_id: 'cat002', title: 'Arcade Central Mania', created_at: '2026-10-14T14:20:00Z' },
                { game_id: 'gam003', developer_id: 'usr004', category_id: 'cat001', title: 'Campus Clash LAN', created_at: '2026-10-22T16:45:00Z' },
                { game_id: 'gam004', developer_id: 'usr004', category_id: 'cat003', title: 'Chronicles of Bicolia Offline RPG', created_at: '2026-11-02T09:10:00Z' }
            ],
            game_versions: [
                { version_id: 'ver001', game_id: 'gam001', version_number: 'v1.0.0-lan', download_url: 'https://downloads.arcade.bsit/builds/lab-shooter-v1.0.zip', uploaded_at: '2026-10-10T10:05:00Z' },
                { version_id: 'ver002', game_id: 'gam001', version_number: 'v1.1.0-lan', download_url: 'https://downloads.arcade.bsit/builds/lab-shooter-v1.1.zip', uploaded_at: '2026-10-18T11:30:00Z' },
                { version_id: 'ver003', game_id: 'gam002', version_number: 'v1.0.0-offline', download_url: 'https://downloads.arcade.bsit/builds/central-mania-v1.0.exe', uploaded_at: '2026-10-14T14:25:00Z' },
                { version_id: 'ver004', game_id: 'gam003', version_number: 'v2.0.1-wifi', download_url: 'https://downloads.arcade.bsit/builds/campus-clash-v2.0.1.apk', uploaded_at: '2026-10-25T13:00:00Z' },
                { version_id: 'ver005', game_id: 'gam004', version_number: 'v0.9.5-beta', download_url: 'https://downloads.arcade.bsit/builds/bicolia-rpg-v0.9.5.zip', uploaded_at: '2026-11-02T09:15:00Z' }
            ],
            reviews: [
                { review_id: 'rev001', game_id: 'gam001', user_id: 'usr002', rating: 4.75, comment: 'Zero lag across IT Lab 4 LAN switch! Smooth 60 FPS gameplay.', created_at: '2026-10-19T15:00:00Z' },
                { review_id: 'rev002', game_id: 'gam001', user_id: 'usr003', rating: 4.50, comment: 'Solid UDP socket implementation and clean local lobby discovery.', created_at: '2026-10-20T10:12:00Z' },
                { review_id: 'rev003', game_id: 'gam002', user_id: 'usr002', rating: 5.00, comment: 'Addictive standalone arcade loop. Runs great offline without internet.', created_at: '2026-10-21T16:40:00Z' },
                { review_id: 'rev004', game_id: 'gam003', user_id: 'usr003', rating: 4.25, comment: 'Great Android APK Wi-Fi hotspot multiplayer test during defense.', created_at: '2026-10-28T11:05:00Z' }
            ],
            game_sessions: [
                { session_id: 'ses001', version_id: 'ver001', user_id: 'usr002', score: 2500, play_time_minutes: 45.50, played_at: '2026-10-12T13:20:00Z' },
                { session_id: 'ses002', version_id: 'ver002', user_id: 'usr002', score: 3450, play_time_minutes: 62.00, played_at: '2026-10-19T14:50:00Z' },
                { session_id: 'ses003', version_id: 'ver003', user_id: 'usr002', score: 980, play_time_minutes: 18.50, played_at: '2026-10-21T16:15:00Z' },
                { session_id: 'ses004', version_id: 'ver004', user_id: 'usr001', score: 4100, play_time_minutes: 55.00, played_at: '2026-10-27T17:10:00Z' },
                { session_id: 'ses005', version_id: 'ver005', user_id: 'usr003', score: 1500, play_time_minutes: 30.00, played_at: '2026-11-04T11:30:00Z' }
            ]
        };

        // ---------------------------------------------------------------------
        // 2. INITIALIZATION & SUPABASE CONNECTION MANAGER
        // ---------------------------------------------------------------------
        window.addEventListener('DOMContentLoaded', async () => {
            lucide.createIcons();
            loadLocalAccounts();
            await initializeSupabaseClient();
            if (!isLiveMode) restoreLocalProfiles();
            populateAllDropdowns();
            renderAllViews();
            await restoreAuthSession();
        });

        function loadLocalAccounts() {
            try {
                const serializedAccounts = localStorage.getItem('bsit_arcade_local_accounts');
                if (!serializedAccounts) return;
                const parsedAccounts = JSON.parse(serializedAccounts);
                if (!Array.isArray(parsedAccounts)) throw new Error('Stored local accounts are not a list.');
                localAccounts = parsedAccounts.filter(account =>
                    account &&
                    typeof account.user_id === 'string' &&
                    typeof account.user_name === 'string' &&
                    typeof account.email === 'string' &&
                    typeof account.role === 'string' &&
                    typeof account.salt === 'string' &&
                    typeof account.password_hash === 'string'
                );
            } catch (error) {
                console.error('Could not read local demo accounts:', error);
                setAuthFeedback("Could not read saved local accounts. Clear this browser's BSIT Arcade local account data and try again.");
            }
        }

        function restoreLocalProfiles() {
            localAccounts.forEach(account => {
                if (!dbState.users.some(user => user.user_id === account.user_id)) {
                    dbState.users.push({
                        user_id: account.user_id,
                        user_name: account.user_name,
                        email: account.email,
                        role: account.role,
                        created_at: account.created_at
                    });
                }
            });
        }

        function bytesToHex(bytes) {
            return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
        }

        function hexToBytes(hex) {
            return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        }

        async function hashLocalPassword(password, salt) {
            if (!globalThis.crypto || !globalThis.crypto.subtle) {
                throw new Error('Secure browser cryptography is unavailable. Open this page in a modern browser.');
            }
            const key = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(password),
                'PBKDF2',
                false,
                ['deriveBits']
            );
            const hash = await crypto.subtle.deriveBits({
                name: 'PBKDF2',
                salt,
                iterations: 120000,
                hash: 'SHA-256'
            }, key, 256);
            return bytesToHex(new Uint8Array(hash));
        }

        async function restoreAuthSession() {
            updateAuthAvailability();
            const localSessionId = sessionStorage.getItem('bsit_arcade_local_session');
            const localAccount = localAccounts.find(account => account.user_id === localSessionId);
            if (localAccount) {
                await finishLocalAuthentication(localAccount);
                return;
            }

            if (isLiveMode && supabaseClient) {
                try {
                    const { data, error } = await supabaseClient.auth.getSession();
                    if (error) throw error;
                    if (data.session) {
                        await finishAuthentication(data.session.user);
                        return;
                    }
                } catch (error) {
                    console.error('Could not restore Supabase Auth session:', error);
                    setAuthFeedback(error.message || 'Could not restore your sign-in session. Please sign in again.');
                }
            }

            const demoUserId = sessionStorage.getItem('bsit_arcade_demo_user');
            if (demoUserId && dbState.users.some(user => user.user_id === demoUserId)) {
                activeUserId = demoUserId;
                enterDemoMode();
                return;
            }
            showAuthView();
        }

        async function initializeSupabaseClient() {
            const url = localStorage.getItem('bsit_arcade_sb_url');
            const key = localStorage.getItem('bsit_arcade_sb_key');

            if (url && key && window.supabase) {
                document.getElementById('sbUrlInput').value = url;
                document.getElementById('sbKeyInput').value = key;
                try {
                    supabaseClient = window.supabase.createClient(url, key);
                    const { error } = await supabaseClient.from('categories').select('category_id').limit(1);
                    if (error) throw error;
                    isLiveMode = true;
                    updateDbStatusUI(true);
                    await syncFromDatabase(false);
                } catch (err) {
                    console.warn('Supabase connection fallback to Demo Mode:', err.message);
                    isLiveMode = false;
                    updateDbStatusUI(false);
                }
            } else {
                isLiveMode = false;
                updateDbStatusUI(false);
            }
            updateAuthAvailability();
        }

        function setAuthMode(mode) {
            authMode = mode;
            const isSignUp = mode === 'signup';
            const nameField = document.getElementById('authNameField');
            const roleField = document.getElementById('authRoleField');
            const nameInput = document.getElementById('authNameInput');
            const signInTab = document.getElementById('signInTab');
            const signUpTab = document.getElementById('signUpTab');

            nameField.classList.toggle('hidden', !isSignUp);
            roleField.classList.toggle('hidden', !isSignUp);
            nameInput.required = isSignUp;
            document.getElementById('authPasswordInput').autocomplete = isSignUp ? 'new-password' : 'current-password';
            signInTab.classList.toggle('is-active', !isSignUp);
            signUpTab.classList.toggle('is-active', isSignUp);
            signInTab.setAttribute('aria-selected', String(!isSignUp));
            signUpTab.setAttribute('aria-selected', String(isSignUp));
            document.getElementById('authModeLabel').innerText = isSignUp ? 'JOIN THE ARCADE' : 'WELCOME BACK';
            document.getElementById('authTitle').innerText = isSignUp ? 'Create your account' : 'Sign in to your account';
            document.getElementById('authDescription').innerText = authBackend === 'local'
                ? (isSignUp
                    ? 'Create a browser-only demo account using fake credentials.'
                    : 'Sign in to a demo account saved in this browser.')
                : (isSignUp
                    ? 'Make a profile to play, review, and publish campus games.'
                    : 'Pick up where you left off in the campus arcade.');
            document.getElementById('authSubmitButton').innerText = isSignUp ? 'Create account' : 'Sign in';
            setAuthFeedback('');
            updateAuthAvailability();
        }

        function setAuthBackend(backend) {
            if (backend === 'supabase' && !isLiveMode) {
                setAuthFeedback('Connect Supabase from the demo app before using Supabase Auth.');
                return;
            }
            authBackend = backend;
            document.getElementById('localAuthBackend').classList.toggle('is-active', backend === 'local');
            document.getElementById('supabaseAuthBackend').classList.toggle('is-active', backend === 'supabase');
            document.getElementById('localAuthBackend').setAttribute('aria-pressed', String(backend === 'local'));
            document.getElementById('supabaseAuthBackend').setAttribute('aria-pressed', String(backend === 'supabase'));
            setAuthFeedback('');
            setAuthMode(authMode);
        }

        function updateAuthAvailability() {
            const notice = document.getElementById('authModeNotice');
            if (!notice) return;
            const supabaseOption = document.getElementById('supabaseAuthBackend');
            supabaseOption.classList.toggle('hidden', !isLiveMode);
            if (!isLiveMode && authBackend === 'supabase') setAuthBackend('local');
            notice.innerText = authBackend === 'local'
                ? 'Local accounts stay in this browser; game changes do not sync. Use fake credentials only; no email is sent.'
                : 'Supabase Auth uses the connected project. Email confirmation depends on its settings.';
        }

        function setAuthFeedback(message) {
            const feedback = document.getElementById('authFeedback');
            if (feedback) feedback.innerText = message;
        }

        function showAuthView() {
            document.getElementById('authView').classList.remove('hidden');
            document.getElementById('appShell').classList.add('hidden');
            updateAuthAvailability();
            lucide.createIcons();
        }

        function enterDemoMode() {
            currentAuthUser = null;
            isLocalAccountSession = false;
            isDemoSession = true;
            isLiveMode = false;
            updateDbStatusUI(false);
            sessionStorage.removeItem('bsit_arcade_local_session');
            sessionStorage.setItem('bsit_arcade_demo_user', activeUserId);
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('appShell').classList.remove('hidden');
            updateSignedInUserUI();
            populateAllDropdowns();
            renderAllViews();
        }

        async function handleAuthSubmit(event) {
            event.preventDefault();
            setAuthFeedback('');
            const email = document.getElementById('authEmailInput').value.trim().toLowerCase();
            const password = document.getElementById('authPasswordInput').value;
            try {
                if (authBackend === 'local') {
                    await handleLocalAuth(email, password);
                    return;
                }
                if (!isLiveMode || !supabaseClient) {
                    setAuthFeedback('Connect Supabase from the demo app first to enable Supabase Auth.');
                    return;
                }

                if (authMode === 'signup') {
                    const displayName = document.getElementById('authNameInput').value.trim();
                    const role = document.getElementById('authRoleInput').value;
                    const { data, error } = await supabaseClient.auth.signUp({
                        email,
                        password,
                        options: { data: { display_name: displayName, role } }
                    });
                    if (error) throw error;
                    if (!data.session || !data.user) {
                        document.getElementById('authPasswordInput').value = '';
                        setAuthMode('signin');
                        document.getElementById('authEmailInput').value = email;
                        setAuthFeedback('Check your email to confirm the new account, then sign in.');
                        return;
                    }
                    await finishAuthentication(data.user);
                    return;
                }

                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                if (!data.user) throw new Error('Supabase did not return a signed-in user.');
                await finishAuthentication(data.user);
            } catch (error) {
                console.error(`${authBackend === 'local' ? 'Local' : 'Supabase'} Auth request failed:`, error);
                setAuthFeedback(error.message || 'Could not complete sign-in. Please try again.');
            }
        }

        async function handleLocalAuth(email, password) {
            if (authMode === 'signup') {
                const existingAccount = localAccounts.find(account => account.email.toLowerCase() === email);
                if (existingAccount) {
                    setAuthFeedback('A local account already uses that email-style username. Sign in or choose another.');
                    return;
                }

                const userName = document.getElementById('authNameInput').value.trim();
                const role = document.getElementById('authRoleInput').value;
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const account = {
                    user_id: crypto.randomUUID(),
                    user_name: userName,
                    email,
                    role,
                    created_at: new Date().toISOString(),
                    salt: bytesToHex(salt),
                    password_hash: await hashLocalPassword(password, salt)
                };
                const updatedAccounts = [...localAccounts, account];
                try {
                    localStorage.setItem('bsit_arcade_local_accounts', JSON.stringify(updatedAccounts));
                } catch (error) {
                    console.error('Could not save local demo account:', error);
                    setAuthFeedback('Could not save the account in this browser. Check browser storage settings and try again.');
                    return;
                }
                localAccounts = updatedAccounts;
                await finishLocalAuthentication(account);
                return;
            }

            const account = localAccounts.find(item => item.email.toLowerCase() === email);
            if (!account) {
                setAuthFeedback('No local account was found for that username. Create an account first.');
                return;
            }
            const enteredHash = await hashLocalPassword(password, hexToBytes(account.salt));
            if (enteredHash !== account.password_hash) {
                setAuthFeedback('Incorrect username or password.');
                return;
            }
            await finishLocalAuthentication(account);
        }

        async function finishLocalAuthentication(account) {
            restoreLocalProfiles();
            const profile = dbState.users.find(user => user.user_id === account.user_id);
            if (!profile) throw new Error('The saved local account profile could not be restored.');

            currentAuthUser = {
                id: account.user_id,
                email: account.email,
                user_metadata: { display_name: account.user_name, role: account.role }
            };
            isLocalAccountSession = true;
            isDemoSession = false;
            isLiveMode = false;
            updateDbStatusUI(false);
            activeUserId = account.user_id;
            sessionStorage.removeItem('bsit_arcade_demo_user');
            sessionStorage.setItem('bsit_arcade_local_session', account.user_id);
            document.getElementById('authPasswordInput').value = '';
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('appShell').classList.remove('hidden');
            updateSignedInUserUI();
            populateAllDropdowns();
            renderAllViews();
        }

        async function finishAuthentication(authUser) {
            const metadata = authUser.user_metadata || {};
            const requestedRole = ['Student', 'Developer', 'Faculty'].includes(metadata.role) ? metadata.role : 'Student';
            const profileResult = await supabaseClient
                .from('users')
                .select('*')
                .eq('user_id', authUser.id)
                .maybeSingle();
            if (profileResult.error) throw profileResult.error;

            let profile = profileResult.data;
            if (!profile) {
                profile = {
                    user_id: authUser.id,
                    user_name: metadata.display_name || authUser.email.split('@')[0],
                    email: authUser.email,
                    role: requestedRole,
                    created_at: new Date().toISOString()
                };
                const { error } = await supabaseClient.from('users').insert([profile]);
                if (error) {
                    throw new Error(`Could not create your user profile: ${error.message}. Confirm the Supabase profile-insert policy is installed.`);
                }
            }

            const existingIndex = dbState.users.findIndex(user => user.user_id === profile.user_id);
            if (existingIndex < 0) dbState.users.push(profile);
            else dbState.users[existingIndex] = profile;
            currentAuthUser = authUser;
            isLocalAccountSession = false;
            isDemoSession = false;
            activeUserId = profile.user_id;
            sessionStorage.removeItem('bsit_arcade_local_session');
            sessionStorage.removeItem('bsit_arcade_demo_user');
            document.getElementById('authPasswordInput').value = '';
            document.getElementById('authView').classList.add('hidden');
            document.getElementById('appShell').classList.remove('hidden');
            updateSignedInUserUI();
            populateAllDropdowns();
            renderAllViews();
        }

        function updateSignedInUserUI() {
            const activeUserSelector = document.getElementById('activeUserSelector');
            const signedInUser = document.getElementById('signedInUser');
            const signOutButton = document.getElementById('signOutButton');
            const profile = dbState.users.find(user => user.user_id === activeUserId);
            const isAuthenticated = Boolean(currentAuthUser);

            activeUserSelector.classList.toggle('hidden', isAuthenticated);
            signedInUser.classList.toggle('hidden', !isAuthenticated);
            signOutButton.classList.toggle('hidden', !isAuthenticated && !isDemoSession);
            signedInUser.innerText = profile ? `${profile.user_name} (${profile.role})` : '';
        }

        async function signOutUser() {
            if (currentAuthUser && !isLocalAccountSession && supabaseClient) {
                const { error } = await supabaseClient.auth.signOut();
                if (error) {
                    console.error('Supabase sign-out failed:', error);
                    showToast(`Could not sign out: ${error.message}`, 'error');
                    return;
                }
            }
            currentAuthUser = null;
            isLocalAccountSession = false;
            isDemoSession = false;
            sessionStorage.removeItem('bsit_arcade_local_session');
            sessionStorage.removeItem('bsit_arcade_demo_user');
            showAuthView();
        }

        async function connectLiveSupabase() {
            if (isLocalAccountSession) {
                showToast('Local demo accounts work with browser-only data. Sign out and choose Supabase Auth to use the live database.', 'error');
                return;
            }
            const url = document.getElementById('sbUrlInput').value.trim();
            const key = document.getElementById('sbKeyInput').value.trim();
            if (!url || !key) {
                showToast('Please enter both Supabase URL and Anon Key.', 'error');
                return;
            }
            localStorage.setItem('bsit_arcade_sb_url', url);
            localStorage.setItem('bsit_arcade_sb_key', key);
            closeSupabaseModal();
            showToast('Connecting to Supabase PostgreSQL...', 'info');
            await initializeSupabaseClient();
            if (isLiveMode) {
                showToast('Connected to Live Supabase Database!', 'success');
                populateAllDropdowns();
                renderAllViews();
            } else {
                showToast('Could not verify Supabase tables. Running in Local Demo Mode.', 'error');
            }
        }

        function disconnectSupabaseToDemo() {
            localStorage.removeItem('bsit_arcade_sb_url');
            localStorage.removeItem('bsit_arcade_sb_key');
            document.getElementById('sbUrlInput').value = '';
            document.getElementById('sbKeyInput').value = '';
            supabaseClient = null;
            isLiveMode = false;
            updateDbStatusUI(false);
            updateAuthAvailability();
            closeSupabaseModal();
            showToast('Switched to Local Demo / Sandbox Mode.', 'info');
            renderAllViews();
        }

        function updateDbStatusUI(live) {
            const dot = document.getElementById('dbStatusDot');
            const label = document.getElementById('dbStatusLabel');
            const btnText = document.getElementById('dbConnectBtnText');

            if (live) {
                dot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse';
                label.innerHTML = `Database Engine: <strong class="text-emerald-400">Live Supabase PostgreSQL</strong> (Synced &amp; RLS Active)`;
                btnText.innerText = 'Supabase Connected';
            } else {
                dot.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse';
                label.innerHTML = `Database Engine: <strong class="text-amber-400">Local Demo / Sandbox Mode</strong> (6-Table BCNF In-Memory Schema)`;
                btnText.innerText = 'Connect Supabase';
            }
        }

        async function syncFromDatabase(notify = true) {
            if (!isLiveMode || !supabaseClient) {
                if (notify) showToast('Refreshed local sandbox data.', 'info');
                renderAllViews();
                return;
            }

            try {
                const [uRes, cRes, gRes, vRes, rRes, sRes] = await Promise.all([
                    supabaseClient.from('users').select('*'),
                    supabaseClient.from('categories').select('*'),
                    supabaseClient.from('games').select('*'),
                    supabaseClient.from('game_versions').select('*'),
                    supabaseClient.from('reviews').select('*'),
                    supabaseClient.from('game_sessions').select('*')
                ]);

                if (!uRes.error && uRes.data.length) dbState.users = uRes.data;
                if (!cRes.error && cRes.data.length) dbState.categories = cRes.data;
                if (!gRes.error && gRes.data) dbState.games = gRes.data;
                if (!vRes.error && vRes.data) dbState.game_versions = vRes.data;
                if (!rRes.error && rRes.data) dbState.reviews = rRes.data;
                if (!sRes.error && sRes.data) dbState.game_sessions = sRes.data;

                populateAllDropdowns();
                renderAllViews();
                if (notify) showToast('Synced all 6 tables from Supabase!', 'success');
            } catch (err) {
                console.error(err);
                if (notify) showToast('Error syncing from Supabase.', 'error');
            }
        }

        // ---------------------------------------------------------------------
        // 3. UI RENDERING & KPI CALCULATIONS
        // ---------------------------------------------------------------------
        function renderAllViews() {
            renderKPIBar();
            renderCategoryPills();
            renderGameGrid();
            renderActivityFeeds();
            renderTask4AnalyticsTable();
            lucide.createIcons();
        }

        function populateAllDropdowns() {
            // Active User Selector
            const userSel = document.getElementById('activeUserSelector');
            userSel.innerHTML = dbState.users.map(u => 
                `<option value="${u.user_id}">${u.user_name} (${u.role})</option>`
            ).join('');
            if (dbState.users.some(u => u.user_id === activeUserId)) {
                userSel.value = activeUserId;
            } else if (dbState.users.length > 0) {
                activeUserId = dbState.users[0].user_id;
                userSel.value = activeUserId;
            }

            // Publish Modal Category Select
            const pubCatSel = document.getElementById('pubCategorySelect');
            pubCatSel.innerHTML = dbState.categories.map(c => 
                `<option value="${c.category_id}">${c.category_name}</option>`
            ).join('');

            // Publish Modal Existing Games Select
            const pubGameSel = document.getElementById('pubExistingGameSelect');
            pubGameSel.innerHTML = dbState.games.map(g => 
                `<option value="${g.game_id}">${g.title}</option>`
            ).join('');
        }

        function handleActiveUserChange(userId) {
            if (currentAuthUser) {
                document.getElementById('activeUserSelector').value = activeUserId;
                return;
            }
            activeUserId = userId;
            if (isDemoSession) sessionStorage.setItem('bsit_arcade_demo_user', userId);
            const user = dbState.users.find(u => u.user_id === userId);
            if (user) showToast(`Acting as ${user.user_name} [${user.role}]`, 'info');
            updateSignedInUserUI();
        }

        function renderKPIBar() {
            const totalGames = dbState.games.length;
            const totalVersions = dbState.game_versions.length;
            const totalPlaytime = dbState.game_sessions.reduce((sum, s) => sum + Number(s.play_time_minutes || 0), 0);
            const avgRating = dbState.reviews.length > 0
                ? (dbState.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / dbState.reviews.length).toFixed(2)
                : '0.00';

            document.getElementById('kpiPublishedGames').innerText = totalGames;
            document.getElementById('kpiTotalVersions').innerText = totalVersions;
            document.getElementById('kpiTotalPlaytime').innerText = totalPlaytime.toFixed(1);
            document.getElementById('kpiAvgRating').innerText = avgRating;
        }

        function renderCategoryPills() {
            const container = document.getElementById('categoryPillsContainer');
            const pills = [
                { id: 'ALL', name: 'All Games' },
                ...dbState.categories.map(c => ({ id: c.category_id, name: c.category_name }))
            ];

            container.innerHTML = pills.map(pill => {
                const isActive = activeCategoryFilter === pill.id;
                const cls = isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium border-slate-800';
                return `<button onclick="selectCategoryFilter('${pill.id}')" class="px-3.5 py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${cls}">${pill.name}</button>`;
            }).join('');
        }

        function selectCategoryFilter(catId) {
            activeCategoryFilter = catId;
            renderCategoryPills();
            renderGameGrid();
        }

        function resetCatalogFilters() {
            activeCategoryFilter = 'ALL';
            document.getElementById('gameSearchInput').value = '';
            renderCategoryPills();
            renderGameGrid();
        }

        function renderGameGrid() {
            const grid = document.getElementById('gameGridContainer');
            const emptyState = document.getElementById('emptyGamesState');
            const query = document.getElementById('gameSearchInput').value.toLowerCase().trim();

            const filtered = dbState.games.filter(game => {
                const matchesCat = activeCategoryFilter === 'ALL' || game.category_id === activeCategoryFilter;
                const dev = dbState.users.find(u => u.user_id === game.developer_id);
                const devName = dev ? dev.user_name.toLowerCase() : '';
                const matchesSearch = game.title.toLowerCase().includes(query) || devName.includes(query);
                return matchesCat && matchesSearch;
            });

            if (filtered.length === 0) {
                grid.innerHTML = '';
                emptyState.classList.remove('hidden');
                lucide.createIcons();
                return;
            }

            emptyState.classList.add('hidden');
            grid.innerHTML = filtered.map(game => {
                const dev = dbState.users.find(u => u.user_id === game.developer_id) || { user_name: 'Unknown Dev' };
                const cat = dbState.categories.find(c => c.category_id === game.category_id) || { category_name: 'General' };
                const versions = dbState.game_versions.filter(v => v.game_id === game.game_id);
                const latestVersion = versions.length > 0 ? versions[versions.length - 1] : { version_number: 'v1.0.0', download_url: '#' };
                const gameReviews = dbState.reviews.filter(r => r.game_id === game.game_id);
                const avgRating = gameReviews.length > 0
                    ? (gameReviews.reduce((acc, r) => acc + Number(r.rating), 0) / gameReviews.length).toFixed(2)
                    : 'New';

                const isLan = cat.category_name.toLowerCase().includes('lan') || cat.category_name.toLowerCase().includes('multiplayer');
                const badgeStyle = isLan
                    ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';

                // Determine file extension tag from download_url
                const urlLower = latestVersion.download_url.toLowerCase();
                let extTag = '.ZIP';
                if (urlLower.endsWith('.exe')) extTag = '.EXE';
                else if (urlLower.endsWith('.apk')) extTag = '.APK';

                return `
                    <article class="bg-slatepanel border border-slate-800/90 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 group">
                        <div class="space-y-4">
                            <!-- Card Top Badges -->
                            <div class="flex justify-between items-start gap-2">
                                <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold border ${badgeStyle} flex items-center gap-1.5">
                                    <i data-lucide="${isLan ? 'wifi' : 'cpu'}" class="w-3 h-3"></i>
                                    ${cat.category_name}
                                </span>
                                <span class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    \u2605 ${avgRating}
                                </span>
                            </div>

                            <!-- Title & Developer -->
                            <div>
                                <h3 onclick="openGameDetailModal('${game.game_id}')" class="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1">
                                    ${game.title}
                                </h3>
                                <p class="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                                    <i data-lucide="code-2" class="w-3.5 h-3.5 text-slate-500"></i>
                                    <span>Dev: <strong class="text-slate-300 font-medium">${dev.user_name}</strong></span>
                                </p>
                            </div>

                            <!-- Latest Build Metadata Box -->
                            <div class="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                                <div>
                                    <span class="text-[10px] text-slate-500 block uppercase">Latest Build</span>
                                    <span class="text-emerald-400 font-bold">${latestVersion.version_number}</span>
                                </div>
                                <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] text-cyan-300">
                                    ${extTag} Package
                                </span>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="pt-4 mt-4 border-t border-slate-800/80 flex items-center gap-2">
                            <button onclick="openGameDetailModal('${game.game_id}')" class="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                                <i data-lucide="sliders-horizontal" class="w-3.5 h-3.5 text-cyan-400"></i>
                                <span>Inspect / Play &amp; Review</span>
                            </button>
                            <button onclick="triggerDirectDownload('${game.game_id}', '${latestVersion.version_id}')" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/15 transition-all cursor-pointer" title="Download Build">
                                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                                <span>Download</span>
                            </button>
                        </div>
                    </article>
                `;
            }).join('');

            lucide.createIcons();
        }

        function renderActivityFeeds() {
            // Recent Sessions
            const sessionsContainer = document.getElementById('recentSessionsList');
            const sortedSessions = [...dbState.game_sessions].reverse();
            sessionsContainer.innerHTML = sortedSessions.map(s => {
                const user = dbState.users.find(u => u.user_id === s.user_id) || { user_name: 'Student' };
                const ver = dbState.game_versions.find(v => v.version_id === s.version_id) || { version_number: 'v1.0', game_id: '' };
                const game = dbState.games.find(g => g.game_id === ver.game_id) || { title: 'Unknown Game' };
                return `
                    <div class="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                        <div class="min-w-0">
                            <p class="font-bold text-slate-200 truncate">${game.title} <span class="text-cyan-400 font-mono text-[11px]">(${ver.version_number})</span></p>
                            <p class="text-[11px] text-slate-400 font-mono mt-0.5">Player: ${user.user_name}</p>
                        </div>
                        <div class="text-right font-mono shrink-0">
                            <span class="text-emerald-400 font-bold block">${Number(s.play_time_minutes).toFixed(1)} mins</span>
                            <span class="text-[10px] text-slate-500">Score: ${s.score}</span>
                        </div>
                    </div>
                `;
            }).join('');

            // Recent Reviews
            const reviewsContainer = document.getElementById('recentReviewsList');
            const sortedReviews = [...dbState.reviews].reverse();
            reviewsContainer.innerHTML = sortedReviews.map(r => {
                const user = dbState.users.find(u => u.user_id === r.user_id) || { user_name: 'Reviewer', role: 'Student' };
                const game = dbState.games.find(g => g.game_id === r.game_id) || { title: 'Game' };
                return `
                    <div class="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 space-y-1 text-xs">
                        <div class="flex justify-between items-center gap-2">
                            <span class="font-bold text-slate-200 truncate">${game.title}</span>
                            <span class="text-amber-400 font-mono font-bold shrink-0">\u2605 ${Number(r.rating).toFixed(2)}</span>
                        </div>
                        <p class="text-slate-300 text-[11px] leading-relaxed">"${r.comment || 'No comment provided.'}"</p>
                        <p class="text-[10px] font-mono text-slate-500">&mdash; ${user.user_name} (${user.role})</p>
                    </div>
                `;
            }).join('');
        }

        function renderTask4AnalyticsTable() {
            const tbody = document.getElementById('task4AnalyticsTableBody');
            // Perform relational JOIN & GROUP BY aggregation across games -> game_versions -> game_sessions
            const rows = dbState.game_versions.map(ver => {
                const game = dbState.games.find(g => g.game_id === ver.game_id) || { title: 'Unknown', developer_id: '' };
                const dev = dbState.users.find(u => u.user_id === game.developer_id) || { user_name: 'Unknown' };
                const sessions = dbState.game_sessions.filter(s => s.version_id === ver.version_id);
                const totalSessions = sessions.length;
                const aggregatePlaytime = sessions.reduce((sum, s) => sum + Number(s.play_time_minutes || 0), 0);
                const highScore = sessions.length > 0 ? Math.max(...sessions.map(s => Number(s.score || 0))) : 0;

                return {
                    gameTitle: game.title,
                    versionNumber: ver.version_number,
                    devName: dev.user_name,
                    totalSessions,
                    aggregatePlaytime,
                    highScore
                };
            }).sort((a, b) => b.aggregatePlaytime - a.aggregatePlaytime);

            tbody.innerHTML = rows.map(r => `
                <tr class="hover:bg-slate-800/40 transition-colors">
                    <td class="p-3.5 font-sans font-bold text-white">${r.gameTitle}</td>
                    <td class="p-3.5 text-cyan-400">${r.versionNumber}</td>
                    <td class="p-3.5 font-sans text-slate-400">${r.devName}</td>
                    <td class="p-3.5 text-right text-slate-200">${r.totalSessions}</td>
                    <td class="p-3.5 text-right text-emerald-400 font-bold">${r.aggregatePlaytime.toFixed(2)} mins</td>
                    <td class="p-3.5 text-right text-amber-400">${r.highScore}</td>
                </tr>
            `).join('');
        }

        // ---------------------------------------------------------------------
        // 4. INTERACTIVE GAME DETAIL MODAL (VERSIONS, SESSION LOGGER, REVIEWS)
        // ---------------------------------------------------------------------
        function openGameDetailModal(gameId) {
            currentDetailGameId = gameId;
            const game = dbState.games.find(g => g.game_id === gameId);
            if (!game) return;

            const dev = dbState.users.find(u => u.user_id === game.developer_id) || { user_name: 'Unknown Dev' };
            const cat = dbState.categories.find(c => c.category_id === game.category_id) || { category_name: 'General' };
            const versions = dbState.game_versions.filter(v => v.game_id === gameId);
            const reviews = dbState.reviews.filter(r => r.game_id === gameId);

            const avgRating = reviews.length > 0
                ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(2)
                : 'Unrated';

            document.getElementById('detailGameTitle').innerText = game.title;
            document.getElementById('detailCategoryBadge').innerText = cat.category_name;
            document.getElementById('detailRatingBadge').innerText = `\u2605 ${avgRating} (${reviews.length} reviews)`;
            document.getElementById('detailDeveloperInfo').innerText = `Published by ${dev.user_name} â€¢ Game ID: ${game.game_id}`;

            // Show LAN Guide if Multiplayer (LAN)
            const isLan = cat.category_name.toLowerCase().includes('lan') || cat.category_name.toLowerCase().includes('multiplayer');
            const lanGuide = document.getElementById('detailLanGuide');
            if (isLan) lanGuide.classList.remove('hidden');
            else lanGuide.classList.add('hidden');

            // Render Versions List
            document.getElementById('detailVersionCount').innerText = `${versions.length} Release(s)`;
            document.getElementById('detailVersionsList').innerHTML = versions.map(v => `
                <div class="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                        <span class="font-mono font-bold text-emerald-400">${v.version_number}</span>
                        <span class="text-[11px] text-slate-500 font-mono ml-2">Uploaded: ${new Date(v.uploaded_at).toLocaleDateString()}</span>
                        <p class="text-[11px] font-mono text-slate-400 truncate max-w-md mt-0.5">${v.download_url}</p>
                    </div>
                    <button onclick="triggerDirectDownload('${game.game_id}', '${v.version_id}')" class="bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                        <i data-lucide="download" class="w-3.5 h-3.5"></i> Download Build
                    </button>
                </div>
            `).join('');

            // Populate Session Version Dropdown
            const verSelect = document.getElementById('sessionVersionSelect');
            verSelect.innerHTML = versions.map(v => 
                `<option value="${v.version_id}">${v.version_number} (${v.version_id})</option>`
            ).join('');
            if (versions.length > 0) verSelect.value = versions[versions.length - 1].version_id;

            // Render Game Reviews inside modal
            const reviewsListEl = document.getElementById('detailReviewsList');
            if (reviews.length === 0) {
                reviewsListEl.innerHTML = `<p class="text-[11px] text-slate-500 italic py-2">No reviews yet. Be the first to evaluate this build!</p>`;
            } else {
                reviewsListEl.innerHTML = reviews.map(r => {
                    const author = dbState.users.find(u => u.user_id === r.user_id) || { user_name: 'Student', role: 'Student' };
                    return `
                        <div class="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 text-[11px] space-y-1">
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-slate-200">${author.user_name} <span class="text-slate-500 font-normal">(${author.role})</span></span>
                                <span class="font-mono font-bold text-amber-400">\u2605 ${Number(r.rating).toFixed(2)}</span>
                            </div>
                            <p class="text-slate-300">${r.comment}</p>
                        </div>
                    `;
                }).join('');
            }

            document.getElementById('gameDetailModal').classList.remove('hidden');
            lucide.createIcons();
        }

        function closeGameDetailModal() {
            stopSessionTimer();
            document.getElementById('gameDetailModal').classList.add('hidden');
            currentDetailGameId = null;
        }

        // Live Session Timer Simulator
        function toggleSessionTimer() {
            const btn = document.getElementById('timerToggleBtn');
            if (timerInterval) {
                stopSessionTimer();
            } else {
                btn.innerText = 'Stop Timer';
                btn.classList.replace('text-emerald-400', 'text-rose-400');
                timerInterval = setInterval(() => {
                    timerSeconds++;
                    const mins = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
                    const secs = String(timerSeconds % 60).padStart(2, '0');
                    document.getElementById('liveTimerDisplay').innerText = `${mins}:${secs}`;
                }, 1000);
            }
        }

        function stopSessionTimer() {
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            const btn = document.getElementById('timerToggleBtn');
            if (btn) {
                btn.innerText = 'Start Timer';
                btn.classList.replace('text-rose-400', 'text-emerald-400');
            }
        }

        function applyTimerToInput() {
            const mins = Math.max(0.5, (timerSeconds / 60)).toFixed(2);
            document.getElementById('sessionMinutesInput').value = mins;
            showToast(`Applied ${mins} mins from live timer.`, 'info');
        }

        // Submit Play Session -> `game_sessions`
        async function submitPlaySession() {
            const versionId = document.getElementById('sessionVersionSelect').value;
            const playTimeMinutes = parseFloat(document.getElementById('sessionMinutesInput').value);
            const score = parseInt(document.getElementById('sessionScoreInput').value, 10) || 0;

            if (!versionId || isNaN(playTimeMinutes) || playTimeMinutes < 0) {
                showToast('CHECK Violation: play_time_minutes must be >= 0.00', 'error');
                return;
            }

            const newSession = {
                session_id: 'ses-' + crypto.randomUUID().slice(0, 8),
                version_id: versionId,
                user_id: activeUserId,
                score: score,
                play_time_minutes: Number(playTimeMinutes.toFixed(2)),
                played_at: new Date().toISOString()
            };

            if (isLiveMode && supabaseClient) {
                const { error } = await supabaseClient.from('game_sessions').insert([newSession]);
                if (error) {
                    showToast(`Supabase Error: ${error.message}`, 'error');
                    return;
                }
            }

            dbState.game_sessions.push(newSession);
            showToast(`Logged ${newSession.play_time_minutes} mins play session!`, 'success');
            renderAllViews();
            if (currentDetailGameId) openGameDetailModal(currentDetailGameId);
        }

        // Submit Review -> `reviews` (Enforces CHECK 1.00..5.00 and UNIQUE(user_id, game_id))
        async function submitGameReview() {
            if (!currentDetailGameId) return;
            const rating = parseFloat(document.getElementById('reviewRatingInput').value);
            const comment = document.getElementById('reviewCommentInput').value.trim();

            if (isNaN(rating) || rating < 1.00 || rating > 5.00) {
                showToast('CHECK Constraint: Rating must be between 1.00 and 5.00.', 'error');
                return;
            }

            // Enforce UNIQUE (user_id, game_id) constraint
            const alreadyReviewed = dbState.reviews.some(
                r => r.game_id === currentDetailGameId && r.user_id === activeUserId
            );
            if (alreadyReviewed) {
                showToast('UNIQUE Constraint (uq_user_game_review): Active user already reviewed this game.', 'error');
                return;
            }

            const newReview = {
                review_id: 'rev-' + crypto.randomUUID().slice(0, 8),
                game_id: currentDetailGameId,
                user_id: activeUserId,
                rating: Number(rating.toFixed(2)),
                comment: comment || 'Verified offline & LAN build functionality.',
                created_at: new Date().toISOString()
            };

            if (isLiveMode && supabaseClient) {
                const { error } = await supabaseClient.from('reviews').insert([newReview]);
                if (error) {
                    showToast(`Supabase Constraint Error: ${error.message}`, 'error');
                    return;
                }
            }

            dbState.reviews.push(newReview);
            document.getElementById('reviewCommentInput').value = '';
            showToast('Review submitted to database!', 'success');
            renderAllViews();
            openGameDetailModal(currentDetailGameId);
        }

        // ---------------------------------------------------------------------
        // 5. DEVELOPER PUBLISH GAME / PUSH BUILD WORKFLOW
        // ---------------------------------------------------------------------
        function openPublishModal() {
            populateAllDropdowns();
            setPublishMode('new_game');
            document.getElementById('publishModal').classList.remove('hidden');
            lucide.createIcons();
        }

        function closePublishModal() {
            document.getElementById('publishModal').classList.add('hidden');
        }

        function setPublishMode(mode) {
            publishMode = mode;
            const newBtn = document.getElementById('modeNewGameBtn');
            const verBtn = document.getElementById('modeNewVersionBtn');
            const newGroup = document.getElementById('newGameFieldsGroup');
            const exGroup = document.getElementById('existingGameFieldGroup');

            if (mode === 'new_game') {
                newBtn.className = 'py-1.5 rounded-lg font-bold bg-emerald-500 text-slate-950 transition-all cursor-pointer';
                verBtn.className = 'py-1.5 rounded-lg font-semibold text-slate-400 hover:text-white transition-all cursor-pointer';
                newGroup.classList.remove('hidden');
                exGroup.classList.add('hidden');
            } else {
                verBtn.className = 'py-1.5 rounded-lg font-bold bg-cyan-500 text-slate-950 transition-all cursor-pointer';
                newBtn.className = 'py-1.5 rounded-lg font-semibold text-slate-400 hover:text-white transition-all cursor-pointer';
                newGroup.classList.add('hidden');
                exGroup.classList.remove('hidden');
            }
        }

        function updateSampleDownloadUrl() {
            const ext = document.getElementById('pubPackageTypeSelect').value;
            const titleRaw = document.getElementById('pubGameTitleInput').value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'bsit-game';
            const ver = document.getElementById('pubVersionNumberInput').value.trim() || 'v1.0.0';
            document.getElementById('pubDownloadUrlInput').value = `https://downloads.arcade.bsit/builds/${titleRaw}-${ver}.${ext}`;
        }

        async function handlePublishFormSubmit(event) {
            event.preventDefault();
            const versionNumber = document.getElementById('pubVersionNumberInput').value.trim();
            const downloadUrl = document.getElementById('pubDownloadUrlInput').value.trim();

            if (publishMode === 'new_game') {
                const title = document.getElementById('pubGameTitleInput').value.trim();
                const categoryId = document.getElementById('pubCategorySelect').value;

                if (!title) {
                    showToast('Please enter a Game Title.', 'error');
                    return;
                }

                const newGameId = 'gam-' + crypto.randomUUID().slice(0, 8);
                const newVersionId = 'ver-' + crypto.randomUUID().slice(0, 8);
                const now = new Date().toISOString();

                const newGameRow = {
                    game_id: newGameId,
                    developer_id: activeUserId,
                    category_id: categoryId,
                    title: title,
                    created_at: now
                };

                const newVersionRow = {
                    version_id: newVersionId,
                    game_id: newGameId,
                    version_number: versionNumber,
                    download_url: downloadUrl,
                    uploaded_at: now
                };

                if (isLiveMode && supabaseClient) {
                    const gErr = (await supabaseClient.from('games').insert([newGameRow])).error;
                    if (gErr) { showToast(`Supabase Error: ${gErr.message}`, 'error'); return; }
                    const vErr = (await supabaseClient.from('game_versions').insert([newVersionRow])).error;
                    if (vErr) { showToast(`Supabase Error: ${vErr.message}`, 'error'); return; }
                }

                dbState.games.push(newGameRow);
                dbState.game_versions.push(newVersionRow);
                showToast(`Published "${title}" (${versionNumber})!`, 'success');
            } else {
                const targetGameId = document.getElementById('pubExistingGameSelect').value;
                // Enforce UNIQUE(game_id, version_number)
                const dupVer = dbState.game_versions.some(
                    v => v.game_id === targetGameId && v.version_number.toLowerCase() === versionNumber.toLowerCase()
                );
                if (dupVer) {
                    showToast('UNIQUE Constraint (uq_game_version): Version tag already exists for this game.', 'error');
                    return;
                }

                const newVersionRow = {
                    version_id: 'ver-' + crypto.randomUUID().slice(0, 8),
                    game_id: targetGameId,
                    version_number: versionNumber,
                    download_url: downloadUrl,
                    uploaded_at: new Date().toISOString()
                };

                if (isLiveMode && supabaseClient) {
                    const { error } = await supabaseClient.from('game_versions').insert([newVersionRow]);
                    if (error) { showToast(`Supabase Error: ${error.message}`, 'error'); return; }
                }

                dbState.game_versions.push(newVersionRow);
                showToast(`Pushed build ${versionNumber} to repository!`, 'success');
            }

            closePublishModal();
            populateAllDropdowns();
            renderAllViews();
        }

        // ---------------------------------------------------------------------
        // 6. DOWNLOAD DIALOG, VIEW SWITCHING & UTILITIES
        // ---------------------------------------------------------------------
        function triggerDirectDownload(gameId, versionId) {
            const game = dbState.games.find(g => g.game_id === gameId);
            const ver = dbState.game_versions.find(v => v.version_id === versionId);
            if (!game || !ver) return;

            document.getElementById('dlModalTitle').innerText = game.title;
            document.getElementById('dlModalVersion').innerText = ver.version_number;
            document.getElementById('dlModalUrl').innerText = ver.download_url;
            document.getElementById('dlModalAnchor').href = ver.download_url;

            document.getElementById('downloadModal').classList.remove('hidden');
            lucide.createIcons();
        }

        function closeDownloadModal() {
            document.getElementById('downloadModal').classList.add('hidden');
        }

        function switchMainView(viewName) {
            const storeEl = document.getElementById('storefrontView');
            const analyticsEl = document.getElementById('analyticsView');
            const storeBtn = document.getElementById('navStorefrontBtn');
            const analyticsBtn = document.getElementById('navAnalyticsBtn');

            if (viewName === 'storefront') {
                storeEl.classList.remove('hidden');
                analyticsEl.classList.add('hidden');
                storeBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer';
                analyticsBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer';
            } else {
                storeEl.classList.add('hidden');
                analyticsEl.classList.remove('hidden');
                analyticsBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 text-slate-950 flex items-center gap-1.5 transition-all cursor-pointer';
                storeBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer';
                renderTask4AnalyticsTable();
            }
            lucide.createIcons();
        }

        function openSupabaseModal() {
            document.getElementById('supabaseModal').classList.remove('hidden');
            lucide.createIcons();
        }

        function closeSupabaseModal() {
            document.getElementById('supabaseModal').classList.add('hidden');
        }

        function copySqlBlock(elementId) {
            const text = document.getElementById(elementId).innerText;
            const tempTextArea = document.createElement('textarea');
            tempTextArea.value = text;
            document.body.appendChild(tempTextArea);
            tempTextArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextArea);
            showToast('SQL script copied to clipboard!', 'success');
        }

        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            const styles = {
                success: 'bg-slate-900 border-emerald-500/50 text-emerald-300',
                error: 'bg-slate-900 border-rose-500/50 text-rose-300',
                info: 'bg-slate-900 border-cyan-500/50 text-cyan-300'
            };
            const icons = {
                success: 'check-circle-2',
                error: 'alert-circle',
                info: 'info'
            };

            toast.className = `pointer-events-auto border ${styles[type]} px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-medium transition-all duration-300`;
            toast.innerHTML = `<i data-lucide="${icons[type]}" class="w-4 h-4 shrink-0"></i><span>${message}</span>`;
            container.appendChild(toast);
            lucide.createIcons();

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(8px)';
                setTimeout(() => toast.remove(), 300);
            }, 3400);
        }

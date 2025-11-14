document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Initialization ---
    // const firebaseConfig = {...}; // Same config as Admin Panel
    // firebase.initializeApp(firebaseConfig);
    // const auth = firebase.auth();
    // const db = firebase.database(); // Realtime Database
    // const firestore = firebase.firestore(); // Firestore

    // --- UI Elements ---
    const authScreens = document.getElementById('auth-screens');
    const loginScreen = document.getElementById('login-screen');
    const registerScreen = document.getElementById('register-screen');
    const forgotPasswordScreen = document.getElementById('forgot-password-screen');
    const mainApp = document.getElementById('main-app');

    // Login Form
    const loginForm = document.getElementById('login-form');
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const showRegisterLink = document.getElementById('show-register');
    const showForgotPasswordLink = document.getElementById('show-forgot-password');

    // Register Form
    const registerForm = document.getElementById('register-form');
    const registerNameInput = document.getElementById('register-name');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const showLoginLink = document.getElementById('show-login');

    // Forgot Password Form
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const forgotEmailInput = document.getElementById('forgot-email');
    const backToLoginLink = document.getElementById('back-to-login');

    // App Header
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');

    // Home Page Sections
    const homePage = document.getElementById('home-page');
    const featuredMoviesCarousel = document.getElementById('featured-movies-carousel');
    const allMoviesGrid = document.getElementById('all-movies-grid');
    const liveChannelsGrid = document.getElementById('live-channels-grid');

    // Movie Details Page
    const movieDetailsPage = document.getElementById('movie-details-page');
    const movieDetailsContent = document.getElementById('movie-details-content');
    const backToHomeFromMovieBtn = document.getElementById('back-to-home-from-movie');

    // Channel Player Page
    const channelPlayerPage = document.getElementById('channel-player-page');
    const channelPlayerTitle = document.getElementById('channel-player-title');
    const channelPlayerVideo = document.getElementById('channel-player');
    const backToHomeFromChannelBtn = document.getElementById('back-to-home-from-channel');
    let videoJsPlayer = null; // To hold the Video.js instance

    // Profile Page
    const profilePage = document.getElementById('profile-page');
    const profileNameSpan = document.getElementById('profile-name');
    const profileEmailSpan = document.getElementById('profile-email');
    const profileStatusSpan = document.getElementById('profile-status');
    const profileUsageDurationSpan = document.getElementById('profile-usage-duration');
    const profileLogoutBtn = document.getElementById('profile-logout-btn');
    const whatsappLink = document.getElementById('whatsapp-link');

    // Navigation
    const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
    const logoutNavBtn = document.getElementById('logout-nav-btn');
    const appSections = document.querySelectorAll('.app-section');

    // Global UI elements
    const loadingSpinner = document.getElementById('loading-spinner');
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');

    let allMovies = [];
    let allChannels = [];
    let allCategories = [];
    let currentUserId = null;
    let userWatchStartTime = null; // For tracking usage duration

    // --- UI Utility Functions ---
    const showLoading = () => loadingSpinner.classList.remove('hidden');
    const hideLoading = () => loadingSpinner.classList.add('hidden');

    const showToast = (message, isError = false) => {
        toastMessage.textContent = message;
        toastNotification.classList.remove('error');
        if (isError) {
            toastNotification.classList.add('error');
        }
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    };

    const showScreen = (screenId) => {
        [loginScreen, registerScreen, forgotPasswordScreen].forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
    };

    const showAppSection = (sectionId) => {
        appSections.forEach(section => section.classList.add('hidden'));
        document.getElementById(sectionId).classList.remove('hidden');
        bottomNavItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`.bottom-nav .nav-item[data-target="${sectionId}"]`).classList.add('active');
        // Stop video.js player if switching away from channel player
        if (videoJsPlayer && sectionId !== 'channel-player-page') {
             videoJsPlayer.pause();
             videoJsPlayer.src({ type: "application/x-mpegURL", src: "" }); // Clear source
        }
    };


    // --- Firebase Authentication ---

    // Auth state listener
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUserId = user.uid;
            authScreens.classList.add('hidden');
            mainApp.classList.remove('hidden');
            await initializeUserSession(user);
            loadAppData(); // Load movies, channels, categories
            showAppSection('home-page');
        } else {
            currentUserId = null;
            authScreens.classList.remove('hidden');
            mainApp.classList.add('hidden');
            showScreen('login-screen');
        }
    });

    // Check user block status and usage duration on session start
    const initializeUserSession = async (user) => {
        showLoading();
        try {
            const userDoc = await firestore.collection('users').doc(user.uid).get();
            if (!userDoc.exists) {
                // If user doesn't exist in Firestore, create a basic record
                await firestore.collection('users').doc(user.uid).set({
                    email: user.email,
                    name: user.displayName || 'User',
                    registrationDate: firebase.firestore.FieldValue.serverTimestamp(),
                    blocked: false,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    usageDuration: 0 // In seconds
                });
                showToast('Welcome to STANY MIN TV!');
            } else {
                const userData = userDoc.data();
                if (userData.blocked) {
                    await auth.signOut(); // Force logout blocked users
                    showToast('Your account has been blocked.', true);
                    return;
                }
                 // Start tracking usage duration if not blocked
                userWatchStartTime = Date.now();
                await firestore.collection('users').doc(user.uid).update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            // Listen for changes to user document in Firestore (e.g., admin blocks user)
            firestore.collection('users').doc(user.uid).onSnapshot(async (doc) => {
                const updatedUserData = doc.data();
                if (updatedUserData && updatedUserData.blocked) {
                    await auth.signOut();
                    showToast('Your account has been blocked by an administrator.', true);
                } else if (updatedUserData) {
                    updateProfileUI(updatedUserData); // Update profile in real-time
                }
            }, (error) => {
                console.error('Error listening to user document:', error);
            });

        } catch (error) {
            console.error('Error initializing user session:', error);
            showToast(`Error: ${error.message}`, true);
            await auth.signOut(); // Log out on severe error
        } finally {
            hideLoading();
        }
    };


    // Event listener for tab close/refresh to update usage duration
    window.addEventListener('beforeunload', async () => {
        if (currentUserId && userWatchStartTime) {
            const duration = (Date.now() - userWatchStartTime) / 1000; // Duration in seconds
            const userRef = firestore.collection('users').doc(currentUserId);
            await userRef.update({
                usageDuration: firebase.firestore.FieldValue.increment(duration)
            });
            // Check for auto-block based on total usage
            const settingsRef = await db.ref('settings').once('value');
            const settings = settingsRef.val();
            const autoBlockDurationMinutes = settings?.autoBlockDuration || 30; // Default 30 minutes
            const autoBlockDurationSeconds = autoBlockDurationMinutes * 60;

            const userDoc = await userRef.get();
            if (userDoc.exists && userDoc.data().usageDuration >= autoBlockDurationSeconds) {
                await userRef.update({ blocked: true });
            }
        }
    });


    // --- Auth Form Handlers ---
    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('register-screen'); });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('login-screen'); });
    showForgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('forgot-password-screen'); });
    backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showScreen('login-screen'); });


    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            showToast('Login successful!');
        } catch (error) {
            console.error('Login error:', error.message);
            showToast(`Login failed: ${error.message}`, true);
        } finally {
            hideLoading();
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const name = registerNameInput.value;
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });
            // Create user document in Firestore
            await firestore.collection('users').doc(userCredential.user.uid).set({
                email: email,
                name: name,
                registrationDate: firebase.firestore.FieldValue.serverTimestamp(),
                blocked: false,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                usageDuration: 0 // Initial usage duration
            });
            showToast('Registration successful! Welcome!');
        } catch (error) {
            console.error('Registration error:', error.message);
            showToast(`Registration failed: ${error.message}`, true);
        } finally {
            hideLoading();
        }
    });

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const email = forgotEmailInput.value;
        try {
            await auth.sendPasswordResetEmail(email);
            showToast('Password reset email sent. Check your inbox!');
            showScreen('login-screen');
        } catch (error) {
            console.error('Forgot password error:', error.message);
            showToast(`Password reset failed: ${error.message}`, true);
        } finally {
            hideLoading();
        }
    });

    profileLogoutBtn.addEventListener('click', async () => {
        showLoading();
        try {
            await auth.signOut();
            showToast('Logged out successfully!');
        } catch (error) {
            console.error('Logout error:', error.message);
            showToast(`Logout failed: ${error.message}`, true);
        } finally {
            hideLoading();
        }
    });

    logoutNavBtn.addEventListener('click', async () => {
        showLoading();
        try {
            await auth.signOut();
            showToast('Logged out successfully!');
        } catch (error) {
            console.error('Logout error:', error.message);
            showToast(`Logout failed: ${error.message}`, true);
        } finally {
            hideLoading();
        }
    });

    // --- Data Loading ---
    const loadAppData = async () => {
        showLoading();
        try {
            // Load Movies
            db.ref('movies').on('value', (snapshot) => {
                allMovies = [];
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        allMovies.push({ id: childSnapshot.key, ...childSnapshot.val() });
                    });
                }
                renderMovies(allMovies);
            });

            // Load Channels
            db.ref('liveChannels').on('value', (snapshot) => {
                allChannels = [];
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        allChannels.push({ id: childSnapshot.key, ...childSnapshot.val() });
                    });
                }
                renderChannels(allChannels);
                renderCategoryChannels(); // Re-render categories dropdown if channels change
            });

            // Load Categories
            firestore.collection('categories').onSnapshot(snapshot => {
                allCategories = [];
                categorySelect.innerHTML = '<option value="all">All Categories</option>'; // Reset
                if (!snapshot.empty) {
                    snapshot.forEach(doc => {
                        allCategories.push({ id: doc.id, ...doc.data() });
                        categorySelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`;
                    });
                }
            }, (error) => {
                console.error('Error loading categories:', error);
                showToast('Failed to load categories.', true);
            });

            // Load Admin Settings (for WhatsApp link and auto-block duration)
            db.ref('settings').on('value', (snapshot) => {
                const settings = snapshot.val();
                if (settings && settings.contactNumber) {
                    whatsappLink.href = `https://wa.me/${settings.contactNumber.replace(/\D/g, '')}`; // Format to E.164
                } else {
                    whatsappLink.href = '#'; // Default if no number
                }
            });

        } catch (error) {
            console.error('Error loading app data:', error);
            showToast(`Failed to load data: ${error.message}`, true);
        } finally {
            hideLoading();
        }
    };

    // --- Rendering Functions ---
    const renderMovies = (moviesToRender) => {
        featuredMoviesCarousel.innerHTML = '';
        allMoviesGrid.innerHTML = '';

        const featured = moviesToRender.filter(movie => movie.imdbRating >= 7.5).slice(0, 10); // Example: top 10 movies
        featured.forEach(movie => {
            featuredMoviesCarousel.innerHTML += createMovieCardHtml(movie);
        });

        moviesToRender.forEach(movie => {
            allMoviesGrid.innerHTML += createMovieCardHtml(movie);
        });
        attachMovieCardClickListeners();
    };

    const createMovieCardHtml = (movie) => {
        return `
            <div class="movie-card" data-id="${movie.id}">
                <img src="${movie.posterUrl}" alt="${movie.title}">
                <div class="movie-card-info">
                    <h3>${movie.title}</h3>
                    <p>${movie.genre} | ${movie.releaseYear}</p>
                </div>
            </div>
        `;
    };

    const attachMovieCardClickListeners = () => {
        document.querySelectorAll('.movie-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const movieId = e.currentTarget.dataset.id;
                displayMovieDetails(movieId);
            });
        });
    };

    const renderChannels = (channelsToRender) => {
        liveChannelsGrid.innerHTML = '';
        channelsToRender.forEach(channel => {
            liveChannelsGrid.innerHTML += createChannelCardHtml(channel);
        });
        attachChannelCardClickListeners();
    };

    const createChannelCardHtml = (channel) => {
        return `
            <div class="channel-card" data-id="${channel.id}" data-m3u8="${channel.m3u8Link}" data-name="${channel.name}">
                <img src="${channel.posterUrl}" alt="${channel.name}">
                <div class="channel-card-info">
                    <h3>${channel.name}</h3>
                </div>
            </div>
        `;
    };

    const attachChannelCardClickListeners = () => {
        document.querySelectorAll('.channel-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const channelId = e.currentTarget.dataset.id;
                const m3u8Link = e.currentTarget.dataset.m3u8;
                const channelName = e.currentTarget.dataset.name;
                playLiveChannel(m3u8Link, channelName);
            });
        });
    };


    const displayMovieDetails = async (movieId) => {
        showLoading();
        try {
            const movieRef = await db.ref(`movies/${movieId}`).once('value');
            const movie = movieRef.val();
            if (movie) {
                movieDetailsContent.innerHTML = `
                    <img src="${movie.posterUrl}" alt="${movie.title}">
                    <div class="movie-info">
                        <h1>${movie.title}</h1>
                        <p><strong>Genre:</strong> ${movie.genre}</p>
                        <p><strong>Release Year:</strong> ${movie.releaseYear}</p>
                        <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
                        <p>${movie.description}</p>
                        <button class="watch-trailer-btn" data-trailer-url="${movie.trailerUrl}">
                            <i class="fas fa-play-circle"></i> Watch Trailer
                        </button>
                    </div>
                `;
                showAppSection('movie-details-page');
                document.querySelector('.watch-trailer-btn').addEventListener('click', (e) => {
                    const trailerUrl = e.currentTarget.dataset.trailerUrl;
                    if (trailerUrl) {
                        showTrailerPopup(trailerUrl);
                    } else {
                        showToast('Trailer not available.', true);
                    }
                });
            } else {
                showToast('Movie details not found.', true);
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
            showToast('Failed to load movie details.', true);
        } finally {
            hideLoading();
        }
    };

    const showTrailerPopup = (trailerUrl) => {
        const trailerPopup = document.createElement('div');
        trailerPopup.id = 'trailer-popup';
        trailerPopup.innerHTML = `
            <iframe src="${trailerUrl.replace('watch?v=', 'embed/')}?autoplay=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
            <button class="close-trailer-btn">&times;</button>
        `;
        document.body.appendChild(trailerPopup);
        trailerPopup.querySelector('.close-trailer-btn').addEventListener('click', () => {
            trailerPopup.remove();
        });
        trailerPopup.addEventListener('click', (e) => {
            if (e.target === trailerPopup) {
                trailerPopup.remove();
            }
        });
    };

    const playLiveChannel = (m3u8Link, channelName) => {
        showLoading();
        channelPlayerTitle.textContent = channelName;
        channelPlayerVideo.src = m3u8Link;

        if (videoJsPlayer) {
            videoJsPlayer.dispose(); // Dispose previous player instance
        }
        videoJsPlayer = videojs(channelPlayerVideo);
        videoJsPlayer.ready(function() {
            this.play();
            showAppSection('channel-player-page');
            hideLoading();
        });

        videoJsPlayer.on('error', function() {
            showToast('Failed to play channel. Please try again later.', true);
            console.error('Video.js error:', this.error());
            hideLoading();
        });
    };


    const updateProfileUI = async (userData) => {
        profileNameSpan.textContent = userData.name || auth.currentUser.displayName || 'N/A';
        profileEmailSpan.textContent = userData.email || auth.currentUser.email || 'N/A';
        profileStatusSpan.textContent = userData.blocked ? 'Blocked' : 'Active';
        profileStatusSpan.style.color = userData.blocked ? '#ff6347' : '#00e0ff';

        // Calculate remaining usage duration based on total usage and admin settings
        const settingsRef = await db.ref('settings').once('value');
        const settings = settingsRef.val();
        const autoBlockDurationMinutes = settings?.autoBlockDuration || 30; // Default 30 minutes
        const autoBlockDurationSeconds = autoBlockDurationMinutes * 60;

        const currentUsageSeconds = userData.usageDuration || 0;
        const remainingSeconds = Math.max(0, autoBlockDurationSeconds - currentUsageSeconds);

        const formatDuration = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        profileUsageDurationSpan.textContent = remainingSeconds > 0 ? formatDuration(remainingSeconds) : 'Expired (Blocked)';
        profileUsageDurationSpan.style.color = remainingSeconds > 0 ? '#00e0ff' : '#ff6347';
    };


    // --- Search & Filter ---
    const applyFilters = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategoryId = categorySelect.value;

        // Filter Movies
        const filteredMovies = allMovies.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm) || movie.genre.toLowerCase().includes(searchTerm);
            return matchesSearch;
        });
        renderMovies(filteredMovies);

        // Filter Channels
        const filteredChannels = allChannels.filter(channel => {
            const matchesSearch = channel.name.toLowerCase().includes(searchTerm) || channel.description.toLowerCase().includes(searchTerm);
            let matchesCategory = true;
            if (selectedCategoryId !== 'all') {
                const category = allCategories.find(c => c.id === selectedCategoryId);
                matchesCategory = category && category.channels.includes(channel.id);
            }
            return matchesSearch && matchesCategory;
        });
        renderChannels(filteredChannels);
    };

    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);

    // --- Navigation Handlers ---
    bottomNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.target;
            if (targetSection === 'categories-page') {
                // For "Categories", we display all channels, filtered by category selection in the header
                showAppSection('home-page'); // Re-use home page but focus on channel filtering
                // Maybe automatically open the category dropdown or show a category filter specifically
                // For now, it will just show home page, and the header category filter is already there.
                // A dedicated categories page would list categories and allow clicking to filter channels.
            } else {
                showAppSection(targetSection);
            }
        });
    });

    backToHomeFromMovieBtn.addEventListener('click', () => showAppSection('home-page'));
    backToHomeFromChannelBtn.addEventListener('click', () => showAppSection('home-page'));

}); // End DOMContentLoaded

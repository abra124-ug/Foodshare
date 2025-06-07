
        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyANq9cJd9tpTnbfMIY8ImsxWFWsn9prXbI",
            authDomain: "mealswap-15d15.firebaseapp.com",
            projectId: "mealswap-15d15",
            storageBucket: "mealswap-15d15.appspot.com",
            messagingSenderId: "534579466781",
            appId: "1:534579466781:web:b9b42fa8272c0da1f1ecf4",
            measurementId: "G-BEBCMKFVSY"
        };

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // ImageBB API Key
        const IMAGEBB_API_KEY = '1dbc58387d100c16d5e7012f6fd434c1';

        // Global variables
        let currentUser = null;
        let userData = null;
        let selectedRole = 'donor';
        let selectedAvatarType = 'default';
        let selectedAvatar = 'A';
        let selectedAvatarColor = 'color-1';
        let selectedCategory = 'bakery';
        let currentPage = 'home';
        let userListings = [];
        let recentRequests = [];
        let messages = [];
        let notifications = [];
        let listingsLoading = true;
        let messagesLoading = true;
        
        let currentChatUserId = null;
        let currentChannelId = null;
        let currentChatUnsubscribe = null;
        // Global chat variables
        let currentChat = {
            userId: null,
            userName: null,
            channelId: null,
            unsubscribe: null
        };

        
        // Global variables for slide state
        let currentSlide = 0;
        const totalSlides = 3;
        

        // DOM Elements
        const loadingScreen = document.getElementById('loadingScreen');
        const onboardingContainer = document.getElementById('onboardingContainer');
        const onboardingSlides = document.getElementById('onboardingSlides');
        const skipBtn = document.getElementById('skipBtn');
        const nextBtn1 = document.getElementById('nextBtn1');
        const nextBtn2 = document.getElementById('nextBtn2');
        const getStartedBtn = document.getElementById('getStartedBtn');
        const authScreen = document.getElementById('authScreen');
        const appContainer = document.getElementById('appContainer');
        const profileSetup = document.getElementById('profileSetup');
        const defaultAvatarBtn = document.getElementById('defaultAvatarBtn');
        const customAvatarBtn = document.getElementById('customAvatarBtn');
        const defaultAvatarOptions = document.getElementById('defaultAvatarOptions');
        const customAvatarUpload = document.getElementById('customAvatarUpload');
        const avatarUpload = document.getElementById('avatarUpload');
        const avatarPreview = document.getElementById('avatarPreview');
        const completeProfileBtn = document.getElementById('completeProfileBtn');
        const sidebar = document.getElementById('sidebar');
        const mobileHeaderTitle = document.getElementById('mobileHeaderTitle');
        const mainContent = document.getElementById('mainContent');
        const homePage = document.getElementById('homePage');
        const listingsPage = document.getElementById('listingsPage');
        const messagesPage = document.getElementById('messagesPage');
        const profilePage = document.getElementById('profilePage');
        const greeting = document.getElementById('greeting');
        const welcomeUserName = document.getElementById('welcomeUserName');
        const verificationBanner = document.getElementById('verificationBanner');
        const listingsContent = document.getElementById('listingsContent');
        const messagesContent = document.getElementById('messagesContent');
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        const sidebarAvatarInitial = document.getElementById('sidebarAvatarInitial');
        const sidebarAvatarImage = document.getElementById('sidebarAvatarImage');
        const sidebarUserName = document.getElementById('sidebarUserName');
        const sidebarUserStatus = document.getElementById('sidebarUserStatus');
        const verifiedIcon = document.getElementById('verifiedIcon');
        const unverifiedIcon = document.getElementById('unverifiedIcon');
        const statusText = document.getElementById('statusText');
        const mobileHeaderAvatar = document.getElementById('mobileHeaderAvatar');
        const mobileAvatarInitial = document.getElementById('mobileAvatarInitial');
        const mobileAvatarImage = document.getElementById('mobileAvatarImage');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileAvatarInitial = document.getElementById('profileAvatarInitial');
        const profileAvatarImage = document.getElementById('profileAvatarImage');
        const profileUserName = document.getElementById('profileUserName');
        const profileUserRole = document.getElementById('profileUserRole');
        const profileVerificationStatus = document.getElementById('profileVerificationStatus');
        const profileVerificationBanner = document.getElementById('profileVerificationBanner');
        const profileBioText = document.getElementById('profileBioText');
        const profileLocationText = document.getElementById('profileLocationText');
        const profileOrganizationText = document.getElementById('profileOrganizationText');
        const profileOrganizationContainer = document.getElementById('profileOrganizationContainer');
        const listingsNavItem = document.getElementById('listingsNavItem');
        const fabButton = document.getElementById('fabButton');
        const toastContainer = document.getElementById('toastContainer');
        const createListingModal = document.getElementById('createListingModal');
        const listingImagePreview = document.getElementById('listingImagePreview');
        const listingImageUpload = document.getElementById('listingImageUpload');
        const createListingBtn = document.getElementById('createListingBtn');
        const verificationModal = document.getElementById('verificationModal');
        const submitVerificationBtn = document.getElementById('submitVerificationBtn');
        const deleteAccountModal = document.getElementById('deleteAccountModal');

        // Initialize the app
// Add this at app startup
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing onboarding flags if user is logged out
    if (!auth.currentUser) {
        localStorage.removeItem('hasCompletedOnboarding');
    }
    initApp();
});
        
function initApp() {
    setupEventListeners();
    checkAuthState();
}

// Check auth state and handle accordingly
function checkAuthState() {
    loadingScreen.style.display = 'flex';
    
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            await fetchUserData();
            
            // Now check onboarding status for authenticated users
            await checkOnboardingStatus();
        } else {
            // No user is signed in
            showAuthScreen();
        }
    });
}

// Check if user has completed onboarding (only for authenticated users)
async function checkOnboardingStatus() {
    // First check Firestore for profile completion status
    if (userData && userData.profileComplete) {
        localStorage.setItem('hasCompletedOnboarding', 'true');
        showApp();
        return;
    }
    
    // Then check localStorage as fallback
    const onboardingCompleted = localStorage.getItem('hasCompletedOnboarding') === 'true';
    
    if (!onboardingCompleted) {
        showOnboarding();
    } else {
        // Ensure Firestore is updated if localStorage says completed
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid).update({
                profileComplete: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        showApp();
    }
}

function showOnboarding() {
    loadingScreen.style.display = 'none';
    authScreen.style.display = 'none';
    appContainer.style.display = 'none';
    profileSetup.style.display = 'none';
    onboardingContainer.style.display = 'flex';
    
    initOnboardingSlides();
}

function showApp() {
    loadingScreen.style.display = 'none';
    authScreen.style.display = 'none';
    onboardingContainer.style.display = 'none';
    profileSetup.style.display = 'none';
    appContainer.style.display = 'block';
    
    updateUserInterface();
    loadInitialData();
    loadStatsComparison(); // Add this line
    setupRealtimeListeners();
    showPage('home');
}

document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing onboarding flags if user is logged out
    if (!auth.currentUser) {
        localStorage.removeItem('hasCompletedOnboarding');
    }
    initApp();
});

function updateSlide() {
    const slidesContainer = document.querySelector('.onboarding-slides');
    const slides = document.querySelectorAll('.onboarding-slide');
    const indicators = document.querySelectorAll('.slide-indicator');
    const nextBtn = document.getElementById('nextBtn');
    
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
    
    if (nextBtn) {
        nextBtn.textContent = currentSlide === totalSlides - 1 ? 'Get Started' : 'Next';
    }
}

function initOnboardingSlides() {
    const slidesContainer = document.querySelector('.onboarding-slides');
    const slides = document.querySelectorAll('.onboarding-slide');
    const indicators = document.querySelectorAll('.slide-indicator');
    const nextBtn = document.getElementById('nextBtn');
    const skipBtn = document.getElementById('skipBtn');
    
    if (!slidesContainer || !slides.length || !indicators.length || !nextBtn || !skipBtn) {
        console.error('Onboarding elements not found');
        return;
    }

    // Initialize swipe detection
    let touchStartX = 0;
    let touchEndX = 0;
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            goToNextSlide();
        } else if (touchEndX > touchStartX + swipeThreshold) {
            if (currentSlide > 0) {
                currentSlide--;
                updateSlide();
            }
        }
    }
    
    // Set up button event listeners
    nextBtn.addEventListener('click', goToNextSlide);
    skipBtn.addEventListener('click', skipOnboarding);
    
    // Initialize swipe events
    slidesContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slidesContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    // Initialize first slide
    updateSlide();
}

// Global navigation functions
function goToNextSlide() {
    if (currentSlide < totalSlides - 1) {
        currentSlide++;
        updateSlide();
    } else {
        completeOnboarding();
    }
}

function skipOnboarding() {
    completeOnboarding();
}

function completeOnboarding() {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    
    if (currentUser) {
        db.collection('users').doc(currentUser.uid).update({
            profileComplete: true,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(error => {
            console.error('Error updating onboarding status:', error);
        });
    }
    
    document.getElementById('onboardingContainer').style.display = 'none';
    checkAuthState();
}

function setupSearchAndFilters() {
    // Search functionality
    const searchInput = document.getElementById('listingSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterListings);
    }
    
    // Category filter functionality
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            categoryFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            filterListings();
        });
    });
}

function setupEventListeners() {
    // Onboarding navigation
    const skipBtn = document.getElementById('skipBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (skipBtn) skipBtn.addEventListener('click', skipOnboarding);
    if (nextBtn) nextBtn.addEventListener('click', goToNextSlide);

    // Profile setup
    const defaultAvatarBtn = document.getElementById('defaultAvatarBtn');
    const customAvatarBtn = document.getElementById('customAvatarBtn');
    const avatarUpload = document.getElementById('avatarUpload');
    const completeProfileBtn = document.getElementById('completeProfileBtn');
    
    if (defaultAvatarBtn) defaultAvatarBtn.addEventListener('click', showDefaultAvatarOptions);
    if (customAvatarBtn) customAvatarBtn.addEventListener('click', showCustomAvatarUpload);
    if (avatarUpload) avatarUpload.addEventListener('change', handleAvatarUpload);
    if (completeProfileBtn) completeProfileBtn.addEventListener('click', completeProfileSetup);

    // Image uploads
    const listingImageUpload = document.getElementById('listingImageUpload');
    if (listingImageUpload) listingImageUpload.addEventListener('change', handleListingImageUpload);

    // Chat functionality
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatMessageInput = document.getElementById('chatMessageInput');
    
    if (sendMessageBtn) sendMessageBtn.addEventListener('click', sendMessage);
    if (chatMessageInput) {
        chatMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Search and filters
    const searchInput = document.getElementById('listingSearch');
    if (searchInput) searchInput.addEventListener('input', filterListings);

    // Category filters
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            document.querySelectorAll('.category-filter').forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            filterListings();
        });
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) modal.style.display = 'none';
        });
    });

        // Verification banner click handlers
    document.getElementById('verificationBanner')?.addEventListener('click', showVerificationModal);
    document.getElementById('profileVerificationBanner')?.addEventListener('click', showVerificationModal);

    // Verification image uploads
    document.getElementById('idImageUpload')?.addEventListener('change', function(e) {
        handleImageUpload(e, 'idImagePreview');
    });
    document.getElementById('addressImageUpload')?.addEventListener('change', function(e) {
        handleImageUpload(e, 'addressImagePreview');
    });

    // Toast close buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toast-close')) {
            e.target.parentElement.remove();
        }
    });

    // Navigation items
    document.querySelectorAll('.sidebar-item, .nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const page = this.getAttribute('onclick').match(/showPage\('([^']+)'\)/)[1];
            if (page) showPage(page);
        });
    });

    // FAB button
    const fabButton = document.getElementById('fabButton');
    if (fabButton) fabButton.addEventListener('click', showCreateListingModal);

    // Notification bell
    const notificationBadge = document.querySelector('.notification-badge');
    if (notificationBadge) notificationBadge.addEventListener('click', toggleNotificationsModal);
}

        function showAuthScreen() {
            loadingScreen.style.display = 'none';
            authScreen.style.display = 'flex';
            appContainer.style.display = 'none';
            profileSetup.style.display = 'none';
        }

        function showProfileSetup() {
            loadingScreen.style.display = 'none';
            authScreen.style.display = 'none';
            appContainer.style.display = 'none';
            profileSetup.style.display = 'flex';
        }


async function fetchUserData() {
    try {
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            userData = userDoc.data();
        } else {
            // Create new user document if it doesn't exist
            userData = {
                name: currentUser.displayName || '',
                email: currentUser.email,
                role: selectedRole,
                profileComplete: false,
                verified: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                avatarType: 'default',
                avatarInitial: 'A',
                avatarColor: 'color-1',
                bio: '',
                location: '',
                organization: '',
                stats: {
                    donations: 0,
                    requests: 0,
                    peopleHelped: 0,
                    successfulRequests: 0,
                    rating: 0,
                    ratingCount: 0,
                    activeListings: 0,
                    lastMonthDonations: 0,
                    lastMonthActiveListings: 0,
                    lastMonthRating: 0,
                    lastMonthPeopleHelped: 0
                }
            };
            
            await db.collection('users').doc(currentUser.uid).set(userData);
        }
        updateStatsCards(); // Update stats after fetching user data
    } catch (error) {
        console.error('Error fetching user data:', error);
        showToast('Error loading user data', 'error');
    }
}

async function updateNearbyListingsCount() {
    if (userData.role !== 'receiver') return;
    
    try {
        // Get user's location (simplified - in a real app you'd use geolocation)
        const userLocation = userData.location || '';
        
        // Count listings near the user (simplified - in a real app you'd use geoqueries)
        const snapshot = await db.collection('listings')
            .where('status', '==', 'available')
            .get();
            
        const totalListings = snapshot.size;
        document.getElementById('peopleHelped').textContent = totalListings;
        
    } catch (error) {
        console.error('Error counting nearby listings:', error);
    }
}

async function loadInitialData() {
    try {
        // Load user data first to get stats
        await fetchUserData();
        
        // Load user listings based on role
        if (userData.role === 'donor') {
            const listingsSnapshot = await db.collection('listings')
                .where('userId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .get();
            
            userListings = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Load recent requests
            const requestsSnapshot = await db.collection('requests')
                .where('listingOwnerId', '==', currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(3)
                .get();
            
            recentRequests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            // Load all available listings for receivers
            const listingsSnapshot = await db.collection('listings')
                .where('status', '==', 'available')
                .orderBy('createdAt', 'desc')
                .get();
            
            userListings = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        // Load chats with last message info
        const chatsSnapshot = await db.collection('chats')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('lastMessageAt', 'desc')
            .get();
        
        messages = chatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Load notifications
        const notificationsSnapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        notifications = notificationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update UI with loaded data
        updateStatsCards();  // Make sure this is called
        renderUserListings();
        renderMessages();
        renderNotificationsList();
        updateNotificationBadges(notifications.filter(n => !n.read).length);
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showToast('Error loading data: ' + error.message, 'error');
    }
}

function updateStatsCards() {
    if (!userData || !userData.stats) return;

    const stats = userData.stats;
    const isDonor = userData.role === 'donor';

    // Calculate percentage changes with safer checks
    const donationsChange = stats.lastMonthDonations && stats.lastMonthDonations !== 0 ? 
        Math.round((stats.donations - stats.lastMonthDonations) / stats.lastMonthDonations * 100) : 0;
    const activeListingsChange = stats.lastMonthActiveListings && stats.lastMonthActiveListings !== 0 ? 
        Math.round((stats.activeListings - stats.lastMonthActiveListings) / stats.lastMonthActiveListings * 100) : 0;
    const ratingChange = stats.lastMonthRating ? 
        (stats.rating - stats.lastMonthRating).toFixed(1) : 0;
    const peopleHelpedChange = stats.lastMonthPeopleHelped ? 
        (stats.peopleHelped - stats.lastMonthPeopleHelped) : 0;


    // Update all stat cards in one go
    const statCards = [
        {
            element: document.querySelector('.stat-card:nth-child(1)'),
            title: isDonor ? 'Total Donations' : 'Total Requests',
            value: isDonor ? stats.donations || 0 : stats.requests || 0,
            change: donationsChange,
            positive: true // Always show as positive
        },
        {
            element: document.querySelector('.stat-card:nth-child(2)'),
            title: isDonor ? 'Active Listings' : 'Successful Requests',
            value: isDonor ? stats.activeListings || 0 : stats.successfulRequests || 0,
            change: activeListingsChange,
            positive: true
        },
        {
            element: document.querySelector('.stat-card:nth-child(3)'),
            title: 'Your Rating',
            value: stats.rating ? stats.rating.toFixed(1) : '0.0',
            change: ratingChange,
            positive: stats.rating >= (stats.lastMonthRating || 0)
        },
        {
            element: document.querySelector('.stat-card:nth-child(4)'),
            title: isDonor ? 'People Helped' : 'Nearby Listings',
            value: isDonor ? stats.peopleHelped || 0 : userListings.length || 0,
            change: peopleHelpedChange,
            positive: true
        }
    ];

    statCards.forEach(card => {
        if (!card.element) return;
        
        // Update card content
        card.element.querySelector('.stat-title').textContent = card.title;
        card.element.querySelector('.stat-value').textContent = card.value;
        
        // Update change indicator
        const changeElement = card.element.querySelector('.stat-change');
        if (changeElement) {
            changeElement.classList.toggle('positive', card.positive);
            changeElement.classList.toggle('negative', !card.positive);
            
            const arrowIcon = changeElement.querySelector('i');
            const changeText = changeElement.querySelector('span');
            
            if (arrowIcon) {
                arrowIcon.className = card.positive ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
            }
            
            if (changeText) {
                if (card.title === 'Your Rating') {
                    changeText.textContent = `${Math.abs(card.change)} from last month`;
                } else if (card.title === 'People Helped' || card.title === 'Nearby Listings') {
                    changeText.textContent = `${card.change} from last month`;
                } else {
                    changeText.textContent = `${Math.abs(card.change)}% from last month`;
                }
            }
        }
    });
}

// Initialize notifications
async function loadNotifications() {
    try {
        const snapshot = await db.collection('notifications')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .get();
        
        notifications = [];
        snapshot.forEach(doc => {
            notifications.push({ id: doc.id, ...doc.data() });
        });
        
        renderNotificationsList();
        updateNotificationBadges();
        
    } catch (error) {
        console.error('Error loading notifications:', error);
        showToast('Error loading notifications', 'error');
    }
}

    function updateUserInterface() {
    // Update greeting based on time of day
    updateGreeting();
    
    // Update user name
    welcomeUserName.textContent = `Welcome back, ${userData.name || 'User'}!`;
    sidebarUserName.textContent = userData.name || 'User';
    profileUserName.textContent = userData.name || 'User';
    
    // Update user role
    profileUserRole.textContent = userData.role === 'donor' ? 'Donor' : 'Receiver';
    
    // Update verification status
    updateVerificationStatus();
    
    // Update avatar
    updateAvatar();
    
    // Update profile details
    updateProfileDetails();
    
    // Update role-specific UI
    if (userData.role === 'donor') {
        listingsNavItem.innerHTML = '<i class="fas fa-utensils"></i><span>My Listings</span>';
    } else {
        listingsNavItem.innerHTML = '<i class="fas fa-search"></i><span>Browse Listings</span>';
    }
    
    if (userData.role === 'donor' && currentPage === 'listings') {
        fabButton.style.display = 'flex';
    } else {
        fabButton.style.display = 'none';
    }
}

async function loadStatsComparison() {
    try {
        // Get stats from previous month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        const snapshot = await db.collection('userStatsHistory')
            .doc(currentUser.uid)
            .collection('monthly')
            .where('month', '==', firebase.firestore.Timestamp.fromDate(lastMonth))
            .get();
            
        if (!snapshot.empty) {
            const lastMonthStats = snapshot.docs[0].data();
            userData.stats.lastMonthRating = lastMonthStats.rating || 0;
            updateStatsCards();
        }
    } catch (error) {
        console.error('Error loading stats comparison:', error);
    }
}
        function updateGreeting() {
            const hour = new Date().getHours();
            let greetingText = 'Hello';
            
            if (hour < 12) {
                greetingText = 'Good Morning';
            } else if (hour < 18) {
                greetingText = 'Good Afternoon';
            } else {
                greetingText = 'Good Evening';
            }
            
            greeting.textContent = greetingText;
        }

        function updateVerificationStatus() {
            if (userData.verified) {
                // Verified user
                verifiedIcon.style.display = 'inline-block';
                unverifiedIcon.style.display = 'none';
                statusText.textContent = 'Verified';
                verificationBanner.style.display = 'none';
                profileVerificationBanner.style.display = 'none';
                profileVerificationStatus.innerHTML = '<i class="fas fa-check-circle" style="color: var(--primary-green);"></i><span>Verified</span>';
            } else if (userData.verificationStatus === 'pending') {
                // Pending verification
                verifiedIcon.style.display = 'none';
                unverifiedIcon.style.display = 'inline-block';
                statusText.textContent = 'Pending Verification';
                verificationBanner.style.display = 'flex';
                profileVerificationBanner.style.display = 'flex';
                profileVerificationStatus.innerHTML = '<i class="fas fa-clock" style="color: #f59e0b;"></i><span>Pending Verification</span>';
            } else {
                // Unverified user
                verifiedIcon.style.display = 'none';
                unverifiedIcon.style.display = 'inline-block';
                statusText.textContent = 'Unverified';
                verificationBanner.style.display = 'flex';
                profileVerificationBanner.style.display = 'flex';
                profileVerificationStatus.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i><span>Unverified</span>';
            }
        }

        function updateAvatar() {
            if (userData.avatarType === 'default') {
                // Default avatar with initial and color
                sidebarAvatarInitial.textContent = userData.avatarInitial;
                sidebarAvatarInitial.style.display = 'flex';
                sidebarAvatarImage.style.display = 'none';
                sidebarAvatar.style.backgroundColor = '';
                sidebarAvatar.classList.add(userData.avatarColor);
                
                mobileAvatarInitial.textContent = userData.avatarInitial;
                mobileAvatarInitial.style.display = 'flex';
                mobileAvatarImage.style.display = 'none';
                mobileHeaderAvatar.style.backgroundColor = '';
                mobileHeaderAvatar.classList.add(userData.avatarColor);
                
                profileAvatarInitial.textContent = userData.avatarInitial;
                profileAvatarInitial.style.display = 'flex';
                profileAvatarImage.style.display = 'none';
                profileAvatar.style.backgroundColor = '';
                profileAvatar.classList.add(userData.avatarColor);
            } else {
                // Custom avatar image
                sidebarAvatarInitial.style.display = 'none';
                sidebarAvatarImage.style.display = 'block';
                sidebarAvatarImage.src = userData.avatarUrl;
                sidebarAvatar.style.backgroundColor = '';
                sidebarAvatar.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6');
                
                mobileAvatarInitial.style.display = 'none';
                mobileAvatarImage.style.display = 'block';
                mobileAvatarImage.src = userData.avatarUrl;
                mobileHeaderAvatar.style.backgroundColor = '';
                mobileHeaderAvatar.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6');
                
                profileAvatarInitial.style.display = 'none';
                profileAvatarImage.style.display = 'block';
                profileAvatarImage.src = userData.avatarUrl;
                profileAvatar.style.backgroundColor = '';
                profileAvatar.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6');
            }
        }

function updateProfileDetails() {
    // Update bio
    if (userData.bio && userData.bio.trim() !== '') {
        profileBioText.textContent = userData.bio;
    } else {
        profileBioText.textContent = 'No bio provided';
    }
    
    // Update location
    if (userData.location && userData.location.trim() !== '') {
        profileLocationText.textContent = userData.location;
    } else {
        profileLocationText.textContent = 'No location provided';
    }
    
    // Update organization (for both roles)
    if (userData.organization && userData.organization.trim() !== '') {
        profileOrganizationContainer.style.display = 'block';
        profileOrganizationText.textContent = userData.organization;
    } else {
        profileOrganizationContainer.style.display = 'none';
    }
    
    // Update stats
    document.getElementById('totalDonations').textContent = userData.stats?.donations || 0;
    document.getElementById('peopleHelped').textContent = userData.stats?.peopleHelped || 0;
    document.getElementById('userRating').textContent = userData.stats?.rating || 0;
    document.getElementById('activeListings').textContent = userData.stats?.activeListings || 0;
}

  function setupRealtimeListeners() {
    const userListener = db.collection('users').doc(currentUser.uid).onSnapshot((doc) => {
        if (doc.exists) {
            userData = doc.data();
            updateUserInterface();
            
            // For receivers, update nearby listings count
            if (userData.role === 'receiver') {
                updateNearbyListingsCount();
            }
        }
    });

    // Add stats listeners
    const userStatsListener = db.collection('users').doc(currentUser.uid)
    .onSnapshot(doc => {
        if (doc.exists) {
            userData = doc.data();
            updateStatsCards(); // This should update all stats including activeListings
        }
    });
    
        // Listen for activity changes
    db.collection('activities')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .onSnapshot(snapshot => {
            recentActivities = [];
            snapshot.forEach(doc => {
                recentActivities.push({ id: doc.id, ...doc.data() });
            });
            
        });
    
// Listen for notifications
        return db.collection('notifications')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            
            // Update the notifications list
            renderNotificationsList(notifications);
            
            // Update badge counts
            const unreadCount = notifications.filter(n => !n.read).length;
            updateNotificationBadges(unreadCount);
        });
        
         // Notification listener
    const notificationsListener = db.collection('notifications')
        .where('userId', '==', currentUser.uid)
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            renderNotificationsList();
            updateNotificationBadges();
        });
    
        
    // Listen for listing changes (for donors)
    let listingsListener;
    if (userData.role === 'donor') {
        listingsListener = db.collection('listings')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const listings = [];
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        listings.push({ id: change.doc.id, ...change.doc.data() });
                    }
                });
                
                // Merge with existing listings, avoiding duplicates
                const existingIds = new Set(userListings.map(l => l.id));
                const newListings = listings.filter(l => !existingIds.has(l.id));
                userListings = [...userListings, ...newListings];
                
                renderUserListings();
                updateStats();
            });
        
        // Listen for requests (for donors)
        db.collection('requests')
            .where('listingOwnerId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(3)
            .onSnapshot((snapshot) => {
                recentRequests = [];
                snapshot.forEach(doc => {
                    recentRequests.push({ id: doc.id, ...doc.data() });
                });
                renderRecentRequests();
            });
    } else {
        // Listen for all available listings (for receivers)
        listingsListener = db.collection('listings')
            .where('status', '==', 'available')
            .orderBy('createdAt', 'desc')
            .onSnapshot((snapshot) => {
                const listings = [];
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        listings.push({ id: change.doc.id, ...change.doc.data() });
                    }
                });
                
                // Merge with existing listings, avoiding duplicates
                const existingIds = new Set(userListings.map(l => l.id));
                const newListings = listings.filter(l => !existingIds.has(l.id));
                userListings = [...userListings, ...newListings];
                
                renderUserListings();
            });
    }
    
    // Listen for messages
    db.collection('messages')
        .where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastUpdated', 'desc')
        .onSnapshot((snapshot) => {
            messages = [];
            snapshot.forEach(doc => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            renderMessages();
            
            // Update message badges
            const unreadCount = messages.reduce((count, message) => {
                return count + (message[`${currentUser.uid}_unread`] || 0);
            }, 0);
            
            if (unreadCount > 0) {
                document.getElementById('messageBadge').textContent = unreadCount;
                document.getElementById('messageBadge').style.display = 'flex';
                document.getElementById('bottomNavMessageBadge').textContent = unreadCount;
                document.getElementById('bottomNavMessageBadge').style.display = 'flex';
            } else {
                document.getElementById('messageBadge').style.display = 'none';
                document.getElementById('bottomNavMessageBadge').style.display = 'none';
            }
        });
        
     const unsubscribeNotifications = db.collection('notifications')
        .where('userId', '==', currentUser.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapshot => {
            notifications = [];
            snapshot.forEach(doc => {
                notifications.push({ id: doc.id, ...doc.data() });
            });
            renderNotificationsList();
            updateNotificationBadges();
        });
       
           // Chat listener
    const chatsListener = db.collection('chats')
        .where('participants', 'array-contains', currentUser.uid)
        .orderBy('lastMessageAt', 'desc')
        .onSnapshot(snapshot => {
            const newMessages = [];
            snapshot.forEach(doc => {
                newMessages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Only update if there are actual changes
            if (JSON.stringify(newMessages) !== JSON.stringify(messages)) {
                messages = newMessages;
                renderMessages();
            }
        }, error => {
            console.error('Chat listener error:', error);
        });
        // Message listener for current chat
    let messagesListener = null;
    
    // Store the listeners for cleanup
    return {
        userListener,
        listingsListener,
        notificationsListener,
        unsubscribeNotifications,
        chatsListener,
        messagesListener,
        userStatsListener
    };
}

  function updateNotificationBadges(count) {
    const badges = [
        document.getElementById('notificationBadge'),
        document.getElementById('mobileNotificationBadge')
    ];
    
    badges.forEach(badge => {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}
  
  function updateMessageBadges(count) {
    const badges = [
        document.getElementById('messageBadge'),
        document.getElementById('bottomNavMessageBadge'),
        document.getElementById('mobileNotificationBadge')
    ];
    
    badges.forEach(badge => {
        if (badge) {
            if (count > 0) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    });
}


async function promptRating(otherUserId, listingId, isDonor) {
    // Only prompt sometimes (e.g., 30% chance)
    if (Math.random() > 0.3) return;

    const rating = prompt(`How would you rate this ${isDonor ? 'donor' : 'receiver'} (1-5 stars)?`);
    if (rating && rating >= 1 && rating <= 5) {
        try {
            const otherUserRef = db.collection('users').doc(otherUserId);
            const otherUserDoc = await otherUserRef.get();
            
            const currentRating = otherUserDoc.data().stats?.rating || 0;
            const currentCount = otherUserDoc.data().stats?.ratingCount || 0;
            
            const newRating = ((currentRating * currentCount) + parseInt(rating)) / (currentCount + 1);
            
            await otherUserRef.update({
                'stats.rating': newRating,
                'stats.ratingCount': firebase.firestore.FieldValue.increment(1),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            showToast(`Thank you for your rating!`, 'success');
            
            // Record the rating transaction
            await db.collection('ratings').add({
                raterId: currentUser.uid,
                ratedId: otherUserId,
                listingId: listingId,
                rating: parseInt(rating),
                isDonor: isDonor,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
        } catch (error) {
            console.error('Error submitting rating:', error);
        }
    }
}

function renderUserListings() {
    listingsLoading = false;
    listingsContent.innerHTML = '';
    
    if (userListings.length === 0) {
        listingsContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <h3>No Listings Found</h3>
                <p>${userData.role === 'donor' ? 'You haven\'t created any listings yet' : 'No available listings in your area'}</p>
            </div>
        `;
        return;
    }
    
    const listingsContainer = document.createElement('div');
    listingsContainer.className = 'food-list';
    
    userListings.forEach(listing => {
        const expiryDate = listing.expiryDate?.toDate() || new Date();
        const today = new Date();
        const timeDiff = expiryDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const isExpired = daysDiff < 0;
        const isUnavailable = listing.status === 'unavailable';
        
        const userRequest = listing.requests?.find(r => r.receiverId === currentUser.uid);
        
        const listingElement = document.createElement('div');
        listingElement.className = `food-card ${isExpired ? 'expired' : ''} ${isUnavailable ? 'unavailable' : ''}`;
        listingElement.innerHTML = `
            <div class="listing-status-badge ${isUnavailable ? 'unavailable' : listing.status}">
                ${isUnavailable ? 'Unavailable' : listing.status === 'claimed' ? 'Claimed' : isExpired ? 'Expired' : 'Available'}
            </div>
            <img src="${listing.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${listing.title}" class="listing-image" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'">
            <div class="listing-details">
                <div class="listing-header">
                    <h3 class="listing-title">${listing.title}</h3>
                    <span class="listing-category">${formatCategory(listing.category)}</span>
                </div>
                <div class="listing-meta">
                    <span><i class="fas fa-map-marker-alt"></i> ${listing.address || 'No address'}</span>
                    <span class="${isExpired ? 'expired' : daysDiff < 3 ? 'soon' : ''}">
                        <i class="fas fa-clock"></i> 
                        ${isExpired ? 'Expired' : `Expires in ${daysDiff} day${daysDiff !== 1 ? 's' : ''}`}
                    </span>
                </div>
                <p class="listing-description">${listing.description || 'No description provided'}</p>
                <div class="listing-footer">
                    <div class="listing-donor">
                        <div class="donor-avatar" style="background-color: ${getRandomColor()}">
                            ${getInitials(listing.userName)}
                        </div>
                        <span class="donor-name">${listing.userName}</span>
                    </div>
                    ${userData.role === 'receiver' ? `
                        <div class="listing-actions">
                            ${isUnavailable || isExpired ? `
                                <div class="action-icon disabled" title="This listing is not available">
                                    <i class="fas fa-ban"></i>
                                    <span class="tooltip">Not Available</span>
                                </div>
                            ` : userRequest ? 
                                (userRequest.status === 'accepted' ? `
                                    <div class="action-icon" onclick="startChat('${listing.userId}', '${userRequest.messageThreadId || ''}')">
                                        <i class="fas fa-comment"></i>
                                        <span class="tooltip">Chat with Donor</span>
                                    </div>
                                ` : userRequest.status === 'rejected' ? `
                                    <div class="action-icon disabled" title="Request Rejected">
                                        <i class="fas fa-times"></i>
                                        <span class="tooltip">Request Rejected</span>
                                    </div>
                                ` : `
                                    <div class="action-icon disabled" title="Pending Approval">
                                        <i class="fas fa-clock"></i>
                                        <span class="tooltip">Pending Approval</span>
                                    </div>
                                `)
                                : `
                                <div class="action-icon" onclick="createFoodRequest('${listing.id}')">
                                    <i class="fas fa-hand-holding-heart"></i>
                                    <span class="tooltip">Request this Item</span>
                                </div>
                            `}
                        </div>
                    ` : userData.role === 'donor' ? `
                        <div class="listing-actions">
                            ${listing.status === 'available' ? `
                                <div class="action-icon" onclick="markListingUnavailable('${listing.id}')">
                                    <i class="fas fa-times-circle"></i>
                                    <span class="tooltip">Mark as Unavailable</span>
                                </div>
                            ` : ''}
                            ${listing.status === 'unavailable' ? `
                                <div class="action-icon" onclick="markListingAvailable('${listing.id}')">
                                    <i class="fas fa-check-circle"></i>
                                    <span class="tooltip">Mark as Available</span>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        listingsContainer.appendChild(listingElement);
    });
    
    listingsContent.appendChild(listingsContainer);
    
    // Add click handlers for tooltips on mobile
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.action-icon').forEach(icon => {
            icon.addEventListener('click', function(e) {
                // If this is a disabled icon, don't show tooltip
                if (this.classList.contains('disabled')) return;
                
                // Hide all other tooltips
                document.querySelectorAll('.action-icon').forEach(otherIcon => {
                    if (otherIcon !== this) {
                        otherIcon.classList.remove('active');
                    }
                });
                
                // Toggle this tooltip
                this.classList.toggle('active');
                
                // Hide after delay
                setTimeout(() => {
                    this.classList.remove('active');
                }, 2000);
            });
        });
    }
}

async function markListingUnavailable(listingId) {
    try {
        // Confirm with the user
        const confirmed = confirm("Are you sure you want to mark this listing as unavailable? This will prevent any further requests.");
        
        if (!confirmed) return;
        
        // Update the listing status to 'unavailable'
        await db.collection('listings').doc(listingId).update({
            status: 'unavailable',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update the local state
        const listingIndex = userListings.findIndex(l => l.id === listingId);
        if (listingIndex !== -1) {
            userListings[listingIndex].status = 'unavailable';
        }
        
        showToast('Listing marked as unavailable', 'success');
        
        // Re-render the listings
        renderUserListings();
        
    } catch (error) {
        console.error('Error marking listing as unavailable:', error);
        showToast('Failed to update listing status', 'error');
    }
}
function getRandomColor() {
    const colors = ['#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function formatCategory(category) {
    const categories = {
        'bakery': 'Bakery',
        'produce': 'Produce',
        'dairy': 'Dairy',
        'pantry': 'Pantry',
        'prepared': 'Prepared',
        'other': 'Other'
    };
    return categories[category] || 'Other';
}

// Helper function to get initials from name
function getInitials(name) {
    if (!name) return '';
    const parts = name.split(' ');
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0).toUpperCase();
    }
    return initials;
}

// Filter listings based on search and category
function filterListings() {
    const searchTerm = document.getElementById('listingSearch').value.toLowerCase();
    const activeCategory = document.querySelector('.category-filter.active').getAttribute('data-category');
    
    const listings = document.querySelectorAll('.food-card');
    listings.forEach(listing => {
        const title = listing.querySelector('.listing-title').textContent.toLowerCase();
        const description = listing.querySelector('.listing-description').textContent.toLowerCase();
        const category = listing.querySelector('.listing-category').textContent.toLowerCase();
        
        const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
        const matchesCategory = activeCategory === 'all' || category.includes(activeCategory);
        
        if (matchesSearch && matchesCategory) {
            listing.style.display = 'flex';
        } else {
            listing.style.display = 'none';
        }
    });
}

function renderNotifications(notifications, containerId = 'notificationsContent') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3>No Notifications</h3>
                <p>Your notifications will appear here</p>
            </div>
        `;
        return;
    }

    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification-item';
        
        let icon, message, color, actions = '';
        
        switch(notification.type) {
            case 'request':
                icon = 'fa-hand-holding-heart';
                message = `${notification.receiverName} requested your "${notification.listingTitle}" listing`;
                color = 'var(--primary-green)';
                if (notification.status === 'pending') {
                    actions = `
                        <div class="notification-actions">
                            <button class="btn btn-primary" onclick="handleNotificationAction('${notification.id}', 'accept')">
                                Accept
                            </button>
                            <button class="btn btn-secondary" onclick="handleNotificationAction('${notification.id}', 'reject')">
                                Reject
                            </button>
                        </div>
                    `;
                }
                break;
            case 'request_accepted':
                icon = 'fa-check-circle';
                message = `${notification.donorName} accepted your request for "${notification.listingTitle}"`;
                color = 'var(--primary-green)';
                break;
            case 'request_rejected':
                icon = 'fa-times-circle';
                message = `${notification.donorName} declined your request for "${notification.listingTitle}"`;
                color = '#ef4444';
                break;
            default:
                icon = 'fa-bell';
                message = notification.message || 'New notification';
                color = 'var(--gray-400)';
        }
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}" style="color: ${color};"></i>
                <div class="notification-text">
                    <p>${message}</p>
                    <small class="notification-time">
                        <i class="fas fa-clock"></i> ${formatTime(notification.createdAt.toDate())}
                    </small>
                    ${actions}
                </div>
                ${!notification.read ? '<div class="notification-badge"></div>' : ''}
            </div>
        `;
        
        container.appendChild(notificationElement);
    });
}

        function formatCategory(category) {
            const categories = {
                'bakery': 'Bakery',
                'produce': 'Produce',
                'dairy': 'Dairy',
                'pantry': 'Pantry',
                'prepared': 'Prepared',
                'other': 'Other'
            };
            
            return categories[category] || 'Other';
        }

        function formatDate(date) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString(undefined, options);
        }

function formatTime(date) {
    if (!date) return ''; // Return empty string if date is undefined/null
    
    // Check if date is a Firestore Timestamp and convert to Date if needed
    const jsDate = date.toDate ? date.toDate() : date;
    
    const options = { hour: '2-digit', minute: '2-digit' };
    return jsDate.toLocaleTimeString(undefined, options);
}


function showPage(page) {
    currentPage = page;
    
    // Hide all pages
    document.querySelectorAll('.page-content').forEach(el => {
        if (el) el.style.display = 'none'; // Add null check
    });

    // Show the selected page
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.style.display = 'block';
    }

    // Handle special pages
    if (page === 'terms') {
        mobileHeaderTitle.textContent = 'Terms of Service';
    } else if (page === 'privacy') {
        mobileHeaderTitle.textContent = 'Privacy Policy';
    } else if (page === 'contact') {
        mobileHeaderTitle.textContent = 'Contact Us';
    }
    
    // Handle chat page specifically
    if (page === 'chat') {
        document.body.classList.add('chat-page-active');
    } else {
        document.body.classList.remove('chat-page-active');
    }
    
    // Show/hide FAB based on role and page
    if (userData?.role === 'donor' && page === 'listings') {
        if (fabButton) fabButton.style.display = 'flex';
    } else {
        if (fabButton) fabButton.style.display = 'none';
    }
    
    // Update navigation and header
    updateNavigationState(page);
}

async function submitContactForm() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    if (!name || !email || !subject || !message) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // In a real app, you would send this to your backend
        // For demo purposes, we'll just show a success message
        showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Clear the form
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactSubject').value = '';
        document.getElementById('contactMessage').value = '';
        
        // Optionally save to Firestore
        await db.collection('contactMessages').add({
            name: name,
            email: email,
            subject: subject,
            message: message,
            userId: currentUser?.uid || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
    } catch (error) {
        console.error('Error submitting contact form:', error);
        showToast('Failed to send message. Please try again.', 'error');
    }
}

function updateNavigationState(page) {
    // Update active nav items
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active');
    });
    
    if (page === 'home') {
        document.querySelector('.sidebar-item[onclick="showPage(\'home\')"]').classList.add('active');
        document.querySelector('.nav-item[onclick="showPage(\'home\')"]').classList.add('active');
        mobileHeaderTitle.textContent = 'Home';
    } else if (page === 'listings') {
        document.querySelector('.sidebar-item[onclick="showPage(\'listings\')"]').classList.add('active');
        document.querySelector('.nav-item[onclick="showPage(\'listings\')"]').classList.add('active');
        mobileHeaderTitle.textContent = userData.role === 'donor' ? 'My Listings' : 'Browse Listings';
    } else if (page === 'messages') {
        document.querySelector('.sidebar-item[onclick="showPage(\'messages\')"]').classList.add('active');
        document.querySelector('.nav-item[onclick="showPage(\'messages\')"]').classList.add('active');
        mobileHeaderTitle.textContent = 'Messages';
    } else if (page === 'chat') {
        mobileHeaderTitle.textContent = 'Chat';
    } else if (page === 'profile') {
        mobileHeaderTitle.textContent = 'Profile';
    }
    
    // Scroll to top for non-chat pages
    if (page !== 'chat') {
        mainContent.scrollTo(0, 0);
    }
}

        function showDefaultAvatarOptions() {
            defaultAvatarBtn.classList.add('active');
            customAvatarBtn.classList.remove('active');
            defaultAvatarOptions.style.display = 'flex';
            customAvatarUpload.style.display = 'none';
            selectedAvatarType = 'default';
        }

        function showCustomAvatarUpload() {
            defaultAvatarBtn.classList.remove('active');
            customAvatarBtn.classList.add('active');
            defaultAvatarOptions.style.display = 'none';
            customAvatarUpload.style.display = 'flex';
            selectedAvatarType = 'custom';
        }

        function selectDefaultAvatar(element, initial) {
            // Remove selected class from all options
            document.querySelectorAll('.avatar-option').forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            element.classList.add('selected');
            
            // Update selected avatar
            selectedAvatar = initial;
            selectedAvatarColor = element.classList[1]; // Get the color class
            
            // Update preview
            avatarPreview.innerHTML = `<span style="font-size: 3rem; font-weight: 600; color: white;">${initial}</span>`;
            avatarPreview.style.backgroundColor = '';
            avatarPreview.classList.add(selectedAvatarColor);
        }

        function handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!file.type.match('image.*')) {
                showToast('Please select an image file', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
                avatarPreview.style.backgroundColor = '';
                avatarPreview.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6');
            };
            reader.readAsDataURL(file);
        }

        async function completeProfileSetup() {
    try {
        // Show loading state
        const completeProfileBtn = document.getElementById('completeProfileBtn');
        completeProfileBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i><span>Setting Up...</span>';
        completeProfileBtn.disabled = true;
        
        let avatarUrl = '';
        
        // Handle avatar upload based on selected type
        if (selectedAvatarType === 'default') {
            // For default avatar, we just store the initial and color
            avatarUrl = '';
        } else {
            // For custom avatar, upload to ImageBB
            const file = document.getElementById('avatarUpload').files[0];
            if (!file) {
                showToast('Please select a profile photo', 'error');
                completeProfileBtn.innerHTML = '<span>Complete Profile</span>';
                completeProfileBtn.disabled = false;
                return;
            }
            
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMAGEBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (!data.success) {
                throw new Error('Image upload failed');
            }
            
            avatarUrl = data.data.url;
        }

        // Get profile details from form
        const bio = document.getElementById('profileBio').value.trim();
        const location = document.getElementById('profileLocation').value.trim();
        const organization = document.getElementById('profileOrganization').value.trim();

        // Prepare update data
        const updateData = {
            profileComplete: true,
            avatarType: selectedAvatarType,
            avatarInitial: selectedAvatar,
            avatarColor: selectedAvatarColor,
            bio: bio,
            location: location,
            organization: organization, // Include organization for both roles
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Only add avatarUrl if it exists (for custom avatars)
        if (avatarUrl) {
            updateData.avatarUrl = avatarUrl;
        }

        // Update user data in Firestore
        await db.collection('users').doc(currentUser.uid).update(updateData);

        // Update local user data
        userData = {
            ...userData,
            ...updateData,
            profileComplete: true
        };

        // Set onboarding completion in localStorage
        localStorage.setItem('hasCompletedOnboarding', 'true');

        // Show success message
        showToast('Profile setup complete!', 'success');
        
        // Update UI with new profile data
        updateUserInterface();
        
        // Show the app
        showApp();
        
    } catch (error) {
        console.error('Error completing profile setup:', error);
        showToast('Error completing profile setup: ' + error.message, 'error');
    } finally {
        // Reset button state
        const completeProfileBtn = document.getElementById('completeProfileBtn');
        if (completeProfileBtn) {
            completeProfileBtn.innerHTML = '<span>Complete Profile</span>';
            completeProfileBtn.disabled = false;
        }
    }
}

function showCreateListingModal() {
    if (!userData.verified) {
        showToast('Please verify your account to create listings', 'error');
        showPage('profile');
        return;
    }
    
    // Set minimum date to today
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    const minDate = `${yyyy}-${mm}-${dd}`;
    document.getElementById('listingExpiry').min = minDate;
    
    // Reset form
    listingImagePreview.innerHTML = '<i class="fas fa-camera"></i>';
    document.getElementById('listingTitle').value = '';
    document.getElementById('listingDescription').value = '';
    document.getElementById('listingExpiry').value = '';
    document.getElementById('listingAddress').value = '';
    
    // Reset category selection
    document.querySelectorAll('.category-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelector('.category-option[data-category="bakery"]').classList.add('selected');
    selectedCategory = 'bakery';
    
    // Show modal
    createListingModal.style.display = 'flex';
}

        function handleListingImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!file.type.match('image.*')) {
                showToast('Please select an image file', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                listingImagePreview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">`;
            };
            reader.readAsDataURL(file);
        }
        
  async function createListing() {
    try {
        // Get form values
        const title = document.getElementById('listingTitle').value.trim();
        const description = document.getElementById('listingDescription').value.trim();
        const expiryDate = document.getElementById('listingExpiry').value;
        const address = document.getElementById('listingAddress').value.trim();
        const imageFile = document.getElementById('listingImageUpload').files[0];
        
        // Validate form
        if (!title) {
            document.getElementById('listingTitleError').style.display = 'block';
            document.getElementById('listingTitle').parentElement.classList.add('error');
            return;
        }
        
        if (!expiryDate) {
            document.getElementById('listingExpiryError').style.display = 'block';
            document.getElementById('listingExpiryError').textContent = 'Please select an expiry date';
            document.getElementById('listingExpiry').parentElement.classList.add('error');
            return;
        }
        
        // Validate expiry date is not in the past
        const selectedDate = new Date(expiryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day for comparison
        
        if (selectedDate < today) {
            document.getElementById('listingExpiryError').style.display = 'block';
            document.getElementById('listingExpiryError').textContent = 'Expiry date cannot be in the past';
            document.getElementById('listingExpiry').parentElement.classList.add('error');
            return;
        }
        
        if (!address) {
            document.getElementById('listingAddressError').style.display = 'block';
            document.getElementById('listingAddress').parentElement.classList.add('error');
            return;
        }

        // Show loading state on button
        const originalButtonText = createListingBtn.innerHTML;
        createListingBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i><span>Creating...</span>';
        createListingBtn.disabled = true;
        
        let imageUrl = '';
        
        // Upload image if provided
        if (imageFile) {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMAGEBB_API_KEY}`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            if (!data.success) {
                throw new Error('Image upload failed');
            }
            
            imageUrl = data.data.url;
        }
        
        // Create listing in Firestore
        const newListing = {
            userId: currentUser.uid,
            userName: userData.name,
            title: title,
            description: description,
            category: selectedCategory,
            expiryDate: firebase.firestore.Timestamp.fromDate(new Date(expiryDate)),
            address: address,
            imageUrl: imageUrl,
            status: 'available',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add the new listing to Firestore
        const docRef = await db.collection('listings').add(newListing);
        
        // Update UI immediately
        userListings.unshift({
            id: docRef.id,
            ...newListing
        });
        
        renderUserListings();
        
        // Hide modal and show success message
        hideModal('createListingModal');
        showToast('Listing created successfully!', 'success');

                // Update donor stats
        await db.collection('users').doc(currentUser.uid).update({
            'stats.activeListings': firebase.firestore.FieldValue.increment(1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

         // Update donor stats
        await db.collection('users').doc(currentUser.uid).update({
            'stats.activeListings': firebase.firestore.FieldValue.increment(1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Refresh stats
        await fetchUserData();
        
    } catch (error) {
        console.error('Error creating listing:', error);
        showToast('Error creating listing: ' + error.message, 'error');
    } finally {
        // Reset button state
        createListingBtn.innerHTML = originalButtonText;
        createListingBtn.disabled = false;
    }
}

  function selectCategory(element, category) {
      // Remove selected class from all options
      document.querySelectorAll('.category-option').forEach(option => {
          option.classList.remove('selected');
      });
      
      // Add selected class to clicked option
      element.classList.add('selected');
      
      // Update selected category
      selectedCategory = category;
  }

async function createFoodRequest(listingId) {
    try {
        // Get listing details
        const listingDoc = await db.collection('listings').doc(listingId).get();
        if (!listingDoc.exists) {
            showToast('Listing not found', 'error');
            return;
        }
        const listing = listingDoc.data();

        // Check if listing is available
        if (listing.status !== 'available') {
            showToast('This listing is no longer available', 'error');
            return;
        }
        

        // Create unique chat ID (sorted user IDs)
        const participants = [currentUser.uid, listing.userId].sort();
        const channelId = participants.join('-');

        // 1. Create the request record
        const requestRef = await db.collection('requests').add({
            listingId: listingId,
            listingOwnerId: listing.userId,
            receiverId: currentUser.uid,
            status: 'pending',
            chatId: channelId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 2. Create/update the chat document
        const chatRef = db.collection('chats').doc(channelId);
        await chatRef.set({
            id: channelId,
            participants: participants,
            participantsInfo: {
                [currentUser.uid]: {
                    name: userData.name,
                    avatarUrl: userData.avatarUrl || '',
                    lastRead: firebase.firestore.FieldValue.serverTimestamp()
                },
                [listing.userId]: {
                    name: listing.userName,
                    avatarUrl: listing.userAvatarUrl || '',
                    lastRead: null
                }
            },
            listingId: listingId,
            listingTitle: listing.title,
            listingImageUrl: listing.imageUrl || '',
            lastMessage: `${userData.name} requested ${listing.title}`,
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 3. Add initial message to the chat's messages subcollection
        const messageData = {
            text: `${userData.name} requested ${listing.title}`,
            senderId: currentUser.uid,
            senderName: userData.name,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isSystemMessage: true,
            status: 'delivered'
        };
        
        await chatRef.collection('messages').add(messageData);

        // 4. Create notification for the donor
        await db.collection('notifications').add({
            type: 'request',
            requestId: requestRef.id,
            listingId: listingId,
            listingTitle: listing.title,
            receiverId: currentUser.uid,
            receiverName: userData.name,
            donorId: listing.userId,
            messageThreadId: channelId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });

        // 5. Update UI immediately
        messages.unshift({
            id: channelId,
            ...(await chatRef.get()).data()
        });
        renderMessages();

        // 6. Open the chat immediately
        startChat(listing.userId, listing.userName, channelId);

        showToast('Request sent successfully!', 'success');

        // Update receiver stats
        await db.collection('users').doc(currentUser.uid).update({
            'stats.requests': firebase.firestore.FieldValue.increment(1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

    } catch (error) {
        console.error('Request error:', error);
        showToast('Failed to send request: ' + error.message, 'error');
    }
}

// Start a chat with another user
async function startChat(userId, userName, channelId = null) {
    try {
        // Clean up previous chat listener if exists
        if (currentChat.unsubscribe) {
            currentChat.unsubscribe();
        }
        
        // Create channel ID if not provided (sorted user IDs joined by '-')
        const participants = [currentUser.uid, userId].sort();
        channelId = channelId || participants.join('-');
        
        // Update current chat state
        currentChat = {
            userId: userId,
            userName: userName,
            channelId: channelId,
            unsubscribe: null
        };
        
        // Update UI
        document.getElementById('chatHeaderName').textContent = userName;
        document.getElementById('chatHeaderAvatar').innerHTML = getInitials(userName);
        
        // Show loading state
        document.getElementById('chatMessages').innerHTML = `
            <div class="page-loading">
                <div class="page-loading-spinner"></div>
                <div class="page-loading-text">Loading chat...</div>
            </div>
        `;
        
        // Create/update chat document if needed
        const chatRef = db.collection('chats').doc(channelId);
        const chatDoc = await chatRef.get();
        
        if (!chatDoc.exists) {
            await chatRef.set({
                participants: participants,
                participantsInfo: {
                    [currentUser.uid]: {
                        name: userData.name,
                        lastRead: firebase.firestore.FieldValue.serverTimestamp()
                    },
                    [userId]: {
                        name: userName,
                        lastRead: null
                    }
                },
                lastMessage: '',
                lastMessageAt: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update last read timestamp for current user
            await chatRef.update({
                [`participantsInfo.${currentUser.uid}.lastRead`]: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        // Set up real-time listener for messages
        const messagesQuery = db.collection('messages')
            .where('channelId', '==', channelId)
            .orderBy('timestamp', 'asc');
        
        currentChat.unsubscribe = messagesQuery.onSnapshot(snapshot => {
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = '';
            
            if (snapshot.empty) {
                messagesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-comments"></i>
                        <h3>No messages yet</h3>
                        <p>Send a message to start the conversation!</p>
                    </div>
                `;
            } else {
                snapshot.forEach(doc => {
                    const message = doc.data();
                    displayMessage({
                        text: message.text,
                        senderId: message.senderId,
                        timestamp: message.timestamp?.toDate() || new Date()
                    }, message.senderId !== currentUser.uid);
                });
                
                // Scroll to bottom
                setTimeout(() => {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }, 100);
            }
        }, error => {
            console.error('Chat listener error:', error);
            document.getElementById('chatMessages').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error loading messages</h3>
                    <p>${error.message}</p>
                </div>
            `;
        });
        
        // Show the chat page
        showPage('chat');
        
    } catch (error) {
        console.error('Error starting chat:', error);
        showToast('Error starting chat: ' + error.message, 'error');
    }
}

async function loadMessages() {
    try {
        // Load all chats where user is a participant
        const snapshot = await db.collection('chats')
            .where('participants', 'array-contains', currentUser.uid)
            .orderBy('lastMessageAt', 'desc')
            .get();

        messages = [];
        snapshot.forEach(doc => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderMessages();
    } catch (error) {
        console.error('Error loading messages:', error);
        showToast('Error loading messages', 'error');
    }
}

// Display a message in the chat
function displayMessage(message, isReceived) {
    const messagesContainer = document.getElementById('chatMessages');
    const emptyState = messagesContainer.querySelector('.empty-state');
    
    if (emptyState) {
        messagesContainer.removeChild(emptyState);
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${isReceived ? 'received' : 'sent'}`;
    
    const messageTime = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    messageElement.innerHTML = `
        <div class="message-content">${message.text}</div>
        <div class="message-time">${messageTime}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send a chat message
async function sendMessage() {
    const messageInput = document.getElementById('chatMessageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText || !currentChat.channelId) return;
    
    try {
        // Create message object
        const message = {
            channelId: currentChat.channelId,
            text: messageText,
            senderId: currentUser.uid,
            senderName: userData.name,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Display message optimistically
        displayMessage({
            text: messageText,
            senderId: currentUser.uid,
            timestamp: new Date()
        }, false);
        
        // Clear input
        messageInput.value = '';
        
        // Save message to Firestore
        await db.collection('messages').add(message);
        
        // Update chat document
        await db.collection('chats').doc(currentChat.channelId).update({
            lastMessage: messageText,
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
            [`participantsInfo.${currentUser.uid}.lastRead`]: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Check if this is a positive interaction (e.g., contains "thanks")
        if (messageText.toLowerCase().includes('thank') || messageText.toLowerCase().includes('thanks, welcome, nice, good')) {
            // Get chat info to find the listing and other user
            const chatDoc = await db.collection('chats').doc(currentChat.channelId).get();
            if (chatDoc.exists) {
                const chatData = chatDoc.data();
                const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
                
                // Prompt to rate the other user
                promptRating(otherUserId, chatData.listingId, userData.role === 'receiver');
            }
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Error sending message', 'error');
    }
}

// Back to messages from chat
function backToMessages() {
    if (currentChat.unsubscribe) {
        currentChat.unsubscribe();
        currentChat = {
            userId: null,
            userName: null,
            channelId: null,
            unsubscribe: null
        };
    }
    showPage('messages');
}

function renderMessages() {
    const container = document.getElementById('messagesContent');
    container.innerHTML = '';

    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comments"></i>
                <h3>No messages yet</h3>
                <p>Start a conversation by requesting a listing</p>
            </div>
        `;
        return;
    }

    const list = document.createElement('div');
    list.className = 'messages-list';

    messages.forEach(chat => {
        if (!chat || !chat.participants) return; // Skip invalid chat entries
        
        const otherUserId = chat.participants.find(id => id !== currentUser.uid);
        if (!otherUserId) return;
        
        const otherUser = chat.participantsInfo?.[otherUserId] || { name: 'Unknown User' };
        const unreadCount = chat[`${currentUser.uid}_unread`] || 0;
        const lastMessageTime = chat.lastMessageAt;
        
        // Determine if the last message was sent by the other user
        const lastMessageIsReceived = chat.lastMessageSenderId === otherUserId;

        list.innerHTML += `
            <div class="message-item ${unreadCount > 0 ? 'unread' : ''}" onclick="startChat('${otherUserId}', '${otherUser.name}', '${chat.id}')">
                <div class="message-avatar">
                    ${otherUser.avatarUrl ? 
                        `<img src="${otherUser.avatarUrl}" alt="${otherUser.name}">` : 
                        `<span style="background-color: ${stringToColor(otherUser.name)}">${getInitials(otherUser.name)}</span>`
                    }
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <h3>${otherUser.name}</h3>
                        <span class="message-time">${formatTime(lastMessageTime)}</span>
                    </div>
                    <p class="message-preview">
                        ${lastMessageIsReceived ? '' : 'You: '}${chat.lastMessage || 'New chat'}
                    </p>
                    ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
                </div>
            </div>
        `;
    });

    container.appendChild(list);
    
    // Update message badges
    const totalUnread = messages.reduce((sum, chat) => sum + (chat[`${currentUser.uid}_unread`] || 0), 0);
    updateMessageBadges(totalUnread);
}
// Helper functions
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

function formatChatTime(date) {
    if (!date) return '';
    
    const now = new Date();
    const jsDate = date.toDate ? date.toDate() : date;
    const diffDays = Math.floor((now - jsDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return jsDate.toLocaleDateString([], { weekday: 'short' });
    } else {
        return jsDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
}

function filterMessages() {
    const searchTerm = document.getElementById('messagesSearch').value.toLowerCase();
    const messageItems = document.querySelectorAll('.message-item');
    
    messageItems.forEach(item => {
        const name = item.querySelector('h3').textContent.toLowerCase();
        const preview = item.querySelector('.message-preview').textContent.toLowerCase();
        const listing = item.querySelector('.message-listing')?.textContent.toLowerCase() || '';
        
        const matchesSearch = name.includes(searchTerm) || 
                             preview.includes(searchTerm) || 
                             listing.includes(searchTerm);
        
        item.style.display = matchesSearch ? 'flex' : 'none';
    });
}

async function loadRecentActivities() {
    try {
        const snapshot = await db.collection('activities')
            .where('userId', '==', currentUser.uid)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        recentActivities = [];
        snapshot.forEach(doc => {
            recentActivities.push({ id: doc.id, ...doc.data() });
        });
        
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function renderNotificationsList() {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    container.innerHTML = '';

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <h3>No Notifications</h3>
                <p>Your notifications will appear here</p>
            </div>
        `;
        return;
    }

    notifications.forEach(notification => {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification-item ${notification.read ? '' : 'unread'}`;
        
        let icon, message, color, actions = '';
        
        switch(notification.type) {
            case 'request':
                icon = 'fa-hand-holding-heart';
                message = `${notification.receiverName} requested your "${notification.listingTitle}" listing`;
                color = 'var(--primary-green)';
                actions = `
                    <div class="notification-actions">
                        <button class="btn btn-primary" onclick="handleNotificationAction('${notification.id}', 'accept', event)">
                            Accept
                        </button>
                        <button class="btn btn-secondary" onclick="handleNotificationAction('${notification.id}', 'reject', event)">
                            Reject
                        </button>
                        <button class="btn btn-text" onclick="startChat('${notification.receiverId}', '${notification.messageThreadId}')">
                            <i class="fas fa-comment"></i> Chat
                        </button>
                    </div>
                `;
                break;
            case 'request_accepted':
                icon = 'fa-check-circle';
                message = `${notification.donorName} accepted your request for "${notification.listingTitle}"`;
                color = 'var(--primary-green)';
                actions = `
                    <div class="notification-actions">
                        <button class="btn btn-primary" onclick="startChat('${notification.donorId}', '${notification.messageThreadId}')">
                            <i class="fas fa-comment"></i> Message Donor
                        </button>
                    </div>
                `;
                break;
            case 'request_rejected':
                icon = 'fa-times-circle';
                message = `${notification.donorName} declined your request for "${notification.listingTitle}"`;
                color = '#ef4444';
                break;
            default:
                icon = 'fa-bell';
                message = notification.message || 'New notification';
                color = 'var(--gray-400)';
        }
        
        notificationElement.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}" style="color: ${color};"></i>
                <div class="notification-text">
                    <p>${message}</p>
                    <small class="notification-time">
                        <i class="fas fa-clock"></i> ${formatTime(notification.createdAt.toDate())}
                    </small>
                    ${actions}
                </div>
                ${!notification.read ? '<div class="notification-badge"></div>' : ''}
            </div>
        `;
        
        container.appendChild(notificationElement);
    });
}

async function handleNotificationAction(notificationId, action, event) {
    event.stopPropagation();
    
    try {
        const notificationRef = db.collection('notifications').doc(notificationId);
        const notificationDoc = await notificationRef.get();
        
        if (!notificationDoc.exists) return;

        const notification = notificationDoc.data();

        if (action === 'accept') {
            // Update request status
            await db.collection('requests').doc(notification.requestId).update({
                status: 'accepted',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update donor stats
            await updateDonorStats(notification.listingId);

            // Update notification status
            await notificationRef.update({
                status: 'accepted',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: true
            });

            // Create a new notification for the receiver
            await db.collection('notifications').add({
                type: 'request_accepted',
                requestId: notification.requestId,
                listingId: notification.listingId,
                listingTitle: notification.listingTitle,
                donorId: currentUser.uid,
                donorName: userData.name,
                receiverId: notification.receiverId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });

            // Prompt donor to rate receiver
            promptRating(notification.receiverId, notification.listingId, false);

            showToast('Request accepted!', 'success');

            // Update donor stats
        await db.collection('users').doc(currentUser.uid).update({
            'stats.donations': firebase.firestore.FieldValue.increment(1),
            'stats.peopleHelped': firebase.firestore.FieldValue.increment(1),
            'stats.activeListings': firebase.firestore.FieldValue.increment(-1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update receiver stats
        await db.collection('users').doc(notification.receiverId).update({
            'stats.successfulRequests': firebase.firestore.FieldValue.increment(1),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        } else if (action === 'reject') {
            // ... existing rejection code ...
        }

        // Update the notifications list
        await loadNotifications();
    } catch (error) {
        console.error('Error handling notification action:', error);
        showToast('Error processing request', 'error');
    }
}

async function markAllAsRead() {
    try {
        const batch = db.batch();
        const unreadNotifications = notifications.filter(n => !n.read);
        
        unreadNotifications.forEach(notification => {
            const notificationRef = db.collection('notifications').doc(notification.id);
            batch.update(notificationRef, {
                read: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        showToast('All notifications marked as read', 'success');
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        showToast('Error marking notifications as read', 'error');
    }
}

function showVerificationModal() {
    // Reset form
    document.getElementById('idImagePreview').innerHTML = '<i class="fas fa-id-card"></i>';
    document.getElementById('addressImagePreview').innerHTML = '<i class="fas fa-file-invoice"></i>';
    
    // Clear file inputs
    document.getElementById('idImageUpload').value = '';
    document.getElementById('addressImageUpload').value = '';
    
    // Show modal
    document.getElementById('verificationModal').style.display = 'flex';
}

        function handleImageUpload(event, previewId) {
            const file = event.target.files[0];
            if (!file) return;
            
            if (!file.type.match('image.*')) {
                showToast('Please select an image file', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById(previewId);
                preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: contain;">`;
            };
            reader.readAsDataURL(file);
        }

        function hideVerificationModal() {
            verificationModal.style.display = 'none';
        }

async function submitVerification() {
    try {
        // Validate form
        const idFile = document.getElementById('idImageUpload').files[0];
        const utilityFile = document.getElementById('addressImageUpload').files[0];
        
        if (!idFile) {
            showToast('Please upload your ID photo', 'error');
            return;
        }
        
        if (!utilityFile) {
            showToast('Please upload your utility bill', 'error');
            return;
        }
        
        // Show loading state
        const btn = document.getElementById('submitVerificationBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;
        
        // Upload both images in parallel
        const [idUpload, utilityUpload] = await Promise.all([
            uploadImageToImageBB(idFile),
            uploadImageToImageBB(utilityFile)
        ]);
        
        // Submit verification request to admin
        await db.collection('verificationRequests').add({
            userId: currentUser.uid,
            userName: userData.name,
            userEmail: userData.email,
            idImageUrl: idUpload.url,
            utilityImageUrl: utilityUpload.url,
            status: 'pending',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user verification status to "pending"
        await db.collection('users').doc(currentUser.uid).update({
            verificationStatus: 'pending',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Hide modal and show success
        hideVerificationModal();
        showToast('Verification submitted for review!', 'success');
        
        // Update UI
        userData.verificationStatus = 'pending';
        updateVerificationStatus();
        
    } catch (error) {
        console.error('Verification error:', error);
        showToast('Error submitting verification: ' + error.message, 'error');
    } finally {
        const btn = document.getElementById('submitVerificationBtn');
        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// Helper function for ImageBB uploads
async function uploadImageToImageBB(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMAGEBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    if (!data.success) {
        throw new Error('Image upload failed');
    }
    
    return {
        url: data.data.url,
        deleteUrl: data.data.delete_url
    };
}

        function showDeleteAccountModal() {
            // Reset form
            document.getElementById('deletePassword').value = '';
            document.getElementById('deletePasswordError').style.display = 'none';
            
            // Show modal
            deleteAccountModal.style.display = 'flex';
        }

        async function deleteAccount() {
            try {
                const password = document.getElementById('deletePassword').value;
                
                if (!password) {
                    document.getElementById('deletePasswordError').textContent = 'Please enter your password';
                    document.getElementById('deletePasswordError').style.display = 'block';
                    return;
                }
                
                // Reauthenticate user
                const credential = firebase.auth.EmailAuthProvider.credential(
                    currentUser.email,
                    password
                );
                
                await currentUser.reauthenticateWithCredential(credential);
                
                // Delete user data from Firestore
                await db.collection('users').doc(currentUser.uid).delete();
                
                // Delete user account
                await currentUser.delete();
                
                // Hide modal
                hideModal('deleteAccountModal');
                
                // Show success message
                showToast('Account deleted successfully', 'success');
                
                // Redirect to auth screen
                setTimeout(() => {
                    showAuthScreen();
                }, 1500);
            } catch (error) {
                console.error('Error deleting account:', error);
                
                if (error.code === 'auth/wrong-password') {
                    document.getElementById('deletePasswordError').textContent = 'Incorrect password';
                    document.getElementById('deletePasswordError').style.display = 'block';
                } else {
                    showToast('Error deleting account', 'error');
                }
            }
        }

        function hideModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function showToast(message, type) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            toast.innerHTML = `
                <div class="toast-icon">
                    <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'}"></i>
                </div>
                <div class="toast-content">
                    <h3 class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                    <p class="toast-message">${message}</p>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
            `;
            
            toastContainer.appendChild(toast);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                toast.classList.add('hide');
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }, 5000);
        }

        // Auth functions
        function switchTab(tab) {
            const loginTab = document.getElementById('loginTab');
            const signupTab = document.getElementById('signupTab');
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            const tabIndicator = document.getElementById('tabIndicator');
            
            if (tab === 'login') {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
                
                // Animate tab indicator
                tabIndicator.style.left = '0';
                tabIndicator.style.width = '50%';
                
                // Animate forms
                if (signupForm.style.display !== 'none') {
                    signupForm.style.animation = 'formSwitchOut 0.4s forwards';
                    setTimeout(() => {
                        signupForm.style.display = 'none';
                        loginForm.style.display = 'flex';
                        loginForm.style.animation = 'formSwitchIn 0.4s forwards';
                    }, 300);
                }
            } else {
                loginTab.classList.remove('active');
                signupTab.classList.add('active');
                
                // Animate tab indicator
                tabIndicator.style.left = '50%';
                tabIndicator.style.width = '50%';
                
                // Animate forms
                if (loginForm.style.display !== 'none') {
                    loginForm.style.animation = 'formSwitchOut 0.4s forwards';
                    setTimeout(() => {
                        loginForm.style.display = 'none';
                        signupForm.style.display = 'flex';
                        signupForm.style.animation = 'formSwitchIn 0.4s forwards';
                    }, 300);
                }
            }
        }
        
        function selectRoleOption(element, role) {
            // Remove selected class from all options
            const options = document.querySelectorAll('.role-option');
            options.forEach(option => {
                option.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            element.classList.add('selected');
            
            // Update selected role
            selectedRole = role;
            
            // Show/hide organization field based on role
            if (role === 'donor') {
                document.getElementById('organizationGroup').style.display = 'block';
            } else {
                document.getElementById('organizationGroup').style.display = 'none';
            }
        }
        
        async function login() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const emailField = document.getElementById('loginEmail').parentElement;
            const passwordField = document.getElementById('loginPassword').parentElement;
            const emailError = document.getElementById('loginEmailError');
            const passwordError = document.getElementById('loginPasswordError');
            
            let isValid = true;
            
            // Reset errors
            emailField.classList.remove('error');
            passwordField.classList.remove('error');
            emailError.style.display = 'none';
            passwordError.style.display = 'none';
            
            // Validate email
            if (!email || !email.includes('@')) {
                emailField.classList.add('error');
                emailError.style.display = 'block';
                isValid = false;
            }
            
            // Validate password
            if (!password || password.length < 6) {
                passwordField.classList.add('error');
                passwordError.style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                // Show loading state
                const loginBtn = document.getElementById('loginBtn');
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i><span>Logging In...</span>';
                
                // Sign in with Firebase
                await auth.signInWithEmailAndPassword(email, password);
                
                // Success - handled by auth state listener
            } catch (error) {
                console.error('Login error:', error);
                
                // Show error message
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    showToast('Invalid email or password', 'error');
                } else {
                    showToast('Login failed. Please try again.', 'error');
                }
                
                // Reset button
                loginBtn.innerHTML = '<span>Login</span>';
            }
        }
        
        async function signup() {
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            const nameField = document.getElementById('signupName').parentElement;
            const emailField = document.getElementById('signupEmail').parentElement;
            const passwordField = document.getElementById('signupPassword').parentElement;
            const termsError = document.getElementById('termsError');
            const nameError = document.getElementById('signupNameError');
            const emailError = document.getElementById('signupEmailError');
            const passwordError = document.getElementById('signupPasswordError');
            
            let isValid = true;
            
            // Reset errors
            nameField.classList.remove('error');
            emailField.classList.remove('error');
            passwordField.classList.remove('error');
            termsError.style.display = 'none';
            nameError.style.display = 'none';
            emailError.style.display = 'none';
            passwordError.style.display = 'none';
            
            // Validate name
    if (!name || name.length < 2 || name.length > 30) {
        document.getElementById('signupNameError').textContent = 'Name must be 2-30 characters (letters and numbers only)';
        document.getElementById('signupNameError').style.display = 'block';
        isValid = false;
    }
    
    // Validate email format
    if (!validateEmail(email)) {
        document.getElementById('signupEmailError').textContent = 'Please enter a valid email address';
        document.getElementById('signupEmailError').style.display = 'block';
        isValid = false;
    }
    
    // Validate password (6+ chars)
    if (!password || password.length < 6) {
        document.getElementById('signupPasswordError').textContent = 'Password must be at least 6 characters';
        document.getElementById('signupPasswordError').style.display = 'block';
        isValid = false;
    }
            
            // Validate terms agreement
            if (!agreeTerms) {
                termsError.style.display = 'block';
                isValid = false;
            }
            
            if (!isValid) return;
            
            try {
                // Show loading state
                const signupBtn = document.getElementById('signupBtn');
                signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i><span>Creating Account...</span>';
                
                // Create user with Firebase
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // Update user profile
                await userCredential.user.updateProfile({
                    displayName: name
                });
                
                // Get organization if donor
                const organization = selectedRole === 'donor' ? document.getElementById('profileOrganization').value.trim() : '';
                
                // Create user document in Firestore
                await db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    email: email,
                    role: selectedRole,
                    profileComplete: false,
                    verified: false,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    avatarType: 'default',
                    avatarInitial: 'A',
                    avatarColor: 'color-1',
                    organization: organization,
                    stats: {
                        donations: 0,
                        peopleHelped: 0,
                        rating: 0,
                        activeListings: 0
                    }
                });
                
                // Show success message
                showToast('Account created successfully!', 'success');
                
                // Show profile setup
                currentUser = userCredential.user;
                await fetchUserData();
                showProfileSetup();
            } catch (error) {
                console.error('Signup error:', error);
                if (error.code === 'auth/email-already-in-use') {
                    showToast('Email already in use', 'error');
                } else {
                    showToast('Signup failed. Please try again.', 'error');
                }
                
                // Reset button
                signupBtn.innerHTML = '<span>Create Account</span>';
            }
        }
        
         async function logout() {
            try {
                await auth.signOut();
                showToast('Logged out successfully', 'success');
                showAuthScreen();
            } catch (error) {
                console.error('Logout error:', error);
                showToast('Logout failed', 'error');
            }
        }
        
function toggleNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    if (modal.style.display === 'flex') {
        hideModal('notificationsModal');
    } else {
        showNotificationsModal();
    }
}

function showNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    modal.style.display = 'flex';
    
    // Render notifications in the modal
    renderNotifications(notifications, 'notificationsModalContent');
    
    // Mark notifications as read
    markNotificationsAsRead();
}

function markNotificationsAsRead() {
    notifications.forEach(notification => {
        if (!notification.read) {
            db.collection('notifications').doc(notification.id).update({
                read: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    });
}
      
// When logging out or changing screens
function cleanupListeners() {
    const listeners = setupRealtimeListeners();
    listeners.userListener();
    listeners.listingsListener();
    listeners.notificationsListener();
}      

function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}
    
function validateNameInput(input) {
    // Remove any non-alphanumeric characters
    input.value = input.value.replace(/[^a-zA-Z0-9\s]/g, '');
}

// Validate email format
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
}    
        
   function cleanupListeners() {
    if (currentChat.unsubscribe) {
        currentChat.unsubscribe();
    }
    // Add any other listeners you need to clean up
}
        
 window.addEventListener('DOMContentLoaded', initApp);

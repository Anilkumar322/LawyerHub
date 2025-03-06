/**
 * LawyerHub - Main JavaScript file
 * Handles authentication, UI interactions, and API calls
 */

// Auth utilities
const auth = {
    // Check if user is authenticated
    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },
    
    // Get current user
    getCurrentUser: () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const token = localStorage.getItem('token');
            
            if (token) {
                // Decode the JWT token to get the user ID
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                
                const tokenData = JSON.parse(jsonPayload);
                
                return {
                    ...user,
                    id: tokenData.user_id
                };
            }
            return user;
        } catch (e) {
            return null;
        }
    },
    
    // Get authentication token
    getToken: () => {
        return localStorage.getItem('token');
    },
    
    // Log out user
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },
    
    // API request with authentication
    authenticatedRequest: async (url, options = {}) => {
        const token = auth.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            auth.logout();
            throw new Error('Authentication expired');
        }
        
        return response;
    }
};



// UI utilities
const ui = {
    // Show loading spinner
    showLoading: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></div>';
        }
    },
    
    // Show error message
    showError: (elementId, message) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `<div class="error-message"><i class="fas fa-exclamation-circle"></i> ${message}</div>`;
        }
    },
    
    // Format rating as stars
    formatRatingStars: (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let starsHtml = '';
        
        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }
        
        // Add half star if needed
        if (halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Add empty stars
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }
        
        return starsHtml;
    },
    
    // Format date to relative time (e.g., "2 days ago")
    formatRelativeTime: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    }
};

// API service
const api = {
    // Base URL
    baseUrl: '/api',
    
    // Get featured lawyers
    getFeaturedLawyers: async () => {
        try {
            const response = await fetch(`${api.baseUrl}/lawyers?sort_by=rating&sort_order=-1&per_page=3`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching featured lawyers:', error);
            throw error;
        }
    },
    
    // Search lawyers
    searchLawyers: async (params) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${api.baseUrl}/lawyers?${queryString}`);
            return await response.json();
        } catch (error) {
            console.error('Error searching lawyers:', error);
            throw error;
        }
    },
    
    // Get lawyer profile
    getLawyerProfile: async (lawyerId) => {
        try {
            const response = await fetch(`${api.baseUrl}/lawyers/${lawyerId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching lawyer profile:', error);
            throw error;
        }
    },
    
    // Get lawyer reviews
    getLawyerReviews: async (lawyerId, page = 1, perPage = 10) => {
        try {
            const response = await fetch(`${api.baseUrl}/lawyers/${lawyerId}/reviews?page=${page}&per_page=${perPage}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching lawyer reviews:', error);
            throw error;
        }
    },
    
    // Submit a review
    submitReview: async (lawyerId, reviewData) => {
        try {
            const response = await auth.authenticatedRequest(`${api.baseUrl}/lawyers/${lawyerId}/reviews`, {
                method: 'POST',
                body: JSON.stringify(reviewData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    },
    
    // Update lawyer profile
    updateLawyerProfile: async (lawyerId, profileData) => {
        try {
            const response = await auth.authenticatedRequest(`${api.baseUrl}/lawyers/${lawyerId}`, {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },
    
    // Get categories
    getCategories: async () => {
        try {
            const response = await fetch(`${api.baseUrl}/categories`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }
};

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status and update UI accordingly
    if (auth.isAuthenticated()) {
        const user = auth.getCurrentUser();
        if (user) {
            // Update navigation based on user role
            updateNavigation(user.role);
        }
    }
    
    // Initialize mobile menu toggle if present
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Initialize page-specific functions
    initPage();
});

// Update navigation based on user role
function updateNavigation(role) {
    // Add logout button
    const userMenu = document.querySelector('.user-menu, .auth-buttons');
    
    if (userMenu) {
        if (role === 'lawyer') {
            userMenu.innerHTML = `
                <a href="#" id="logout-btn" class="btn btn-primary">Log Out</a>
            `;
        } else {
            userMenu.innerHTML = `
                <a href="/profile" class="btn btn-outline">My Profile</a>
                <a href="#" id="logout-btn" class="btn btn-primary">Log Out</a>
            `;
        }
        
        // Add logout handler
        document.getElementById('logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            auth.logout();
        });
    }
}

// Initialize page-specific functionality
// Initialize search results page
function initSearchResults() {
    // Get current search parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || '';
    const specialty = urlParams.get('specialty') || '';
    const location = urlParams.get('location') || '';
    
    // You could add additional functionality here if needed:
    // 1. Analytics tracking for searches
    // 2. Enhanced filtering options
    // 3. Sort controls
    // 4. Pagination handlers
    
    console.log('Search results page initialized with:', { query, specialty, location });
    
    // If you want to add any interactive elements to the search results
    // like a "sort by" dropdown, you can initialize them here
    const sortSelect = document.getElementById('sort-results');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            // Get current URL parameters
            const currentParams = new URLSearchParams(window.location.search);
            // Add/update the sort parameter
            currentParams.set('sort_by', this.value);
            // Redirect with new parameters
            window.location.href = `${window.location.pathname}?${currentParams.toString()}`;
        });
    }
}

function getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        // Decode the JWT token
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}
function initPage() {
    const currentPath = window.location.pathname;
    
    // Home page
    if (currentPath === '/' || currentPath === '/index.html') {
        initHomePage();
    }
    // Lawyer dashboard
    else if (currentPath === '/dashboard' || currentPath === '/dashboard.html') {
        initDashboard();
    }
    // Search results
    else if (currentPath.includes('/search')) {
        initSearchResults();
    }
    // Lawyer profile
    else if (currentPath.match(/\/lawyers\/[a-zA-Z0-9]+/)) {
        const lawyerId = currentPath.split('/').pop();
        initLawyerProfile(lawyerId);
    }
}

// Initialize home page
function initHomePage() {
    // Load featured lawyers
    const featuredLawyersContainer = document.querySelector('.lawyers-grid');
    if (featuredLawyersContainer) {
        loadFeaturedLawyers(featuredLawyersContainer);
    }
    
    // Initialize search form
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            // Let the form submit naturally with the action="/search" method="get"
            // No need to prevent default or manually construct URL
            
            // We can add validation if needed
            const queryInput = searchForm.querySelector('input[name="query"]');
            const specialtySelect = searchForm.querySelector('select[name="specialty"]');
            const locationSelect = searchForm.querySelector('select[name="location"]');
            
            // Simple validation - at least one field should have a value
            if ((!queryInput || !queryInput.value.trim()) && 
                (!specialtySelect || !specialtySelect.value) && 
                (!locationSelect || !locationSelect.value)) {
                e.preventDefault();
                alert('Please enter at least one search criteria');
            }
            // Otherwise let the form submit naturally
        });
    }
    
    // Load categories if needed
    const categoriesGrid = document.querySelector('.categories-grid');
    if (categoriesGrid) {
        loadCategories(categoriesGrid);
    }
}

// Load featured lawyers
async function loadFeaturedLawyers(container) {
    try {
        ui.showLoading(container.id);
        const data = await api.getFeaturedLawyers();
        
        if (data.lawyers && data.lawyers.length > 0) {
            container.innerHTML = data.lawyers.map(lawyer => `
                <div class="lawyer-card">
                    <div class="lawyer-img"></div>
                    <div class="lawyer-info">
                        <h3 class="lawyer-name">${lawyer.name}</h3>
                        <p class="lawyer-specialty">${lawyer.specialty.join(', ')}</p>
                        <div class="lawyer-rating">
                            <div class="stars">
                                ${ui.formatRatingStars(lawyer.rating)}
                            </div>
                            <span>${lawyer.rating.toFixed(1)} (${lawyer.review_count} reviews)</span>
                        </div>
                        <p class="lawyer-location">
                            <i class="fas fa-map-marker-alt"></i> ${lawyer.location.city}, ${lawyer.location.state}
                        </p>
                        <div class="lawyer-badges">
                            <span class="reward-badge ${lawyer.reward_tier === 'gold' || lawyer.reward_tier === 'platinum' ? 'premium-badge' : ''}">${lawyer.reward_tier.charAt(0).toUpperCase() + lawyer.reward_tier.slice(1)}</span>
                            ${lawyer.badges.slice(0, 1).map(badge => `<span class="reward-badge">${badge}</span>`).join('')}
                        </div>
                        <a href="/lawyers/${lawyer._id}" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">View Profile</a>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="no-results">No featured lawyers available at the moment.</p>';
        }
    } catch (error) {
        ui.showError(container.id, 'Failed to load featured lawyers. Please try again later.');
    }
}

// Load categories
async function loadCategories(container) {
    try {
        const data = await api.getCategories();
        
        if (data && data.length > 0) {
            container.innerHTML = data.slice(0, 4).map(category => `
                <div class="category-card">
                    <div class="category-icon">
                        <i class="fas ${category.icon}"></i>
                    </div>
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                    <a href="/search?specialty=${encodeURIComponent(category.name)}" class="btn btn-primary">Explore</a>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Initialize lawyer dashboard
function initDashboard() {
    if (!auth.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    
    loadDashboardData();
    setupReviewFilterListeners();
    setupReviewPaginationListeners();
}

// Load dashboard data
async function loadDashboardReviews(lawyerId) {
    const reviewsList = document.querySelector('.reviews-list');
    const loadingSpinner = document.querySelector('.loading-spinner');

    if (!reviewsList || !lawyerId) {
        console.error('Missing required elements or lawyer ID');
        return;
    }

    try {
        // Show loading state
        reviewsList.style.display = 'none';
        loadingSpinner.style.display = 'flex';

        const token = auth.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(
            `/api/lawyers/${lawyerId}/reviews?` +
            `page=${reviewsCurrentPage}&per_page=${REVIEWS_PER_PAGE}` +
            (reviewsCurrentFilter !== 'all' ? `&rating=${reviewsCurrentFilter}` : ''),
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        renderDashboardReviews(data.reviews);
        updateReviewPagination(data.total);

    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsList.innerHTML = `
            <div class="error-message">
                Failed to load reviews. Please try again later.
            </div>
        `;
    } finally {
        loadingSpinner.style.display = 'none';
        reviewsList.style.display = 'block';
    }
}


function setupReviewFilterListeners() {
    const filterButtons = document.querySelectorAll('.review-filters .filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            reviewsCurrentFilter = button.dataset.rating;
            reviewsCurrentPage = 1;
            
            // Get lawyer ID from the current user data
            const user = auth.getCurrentUser();
            if (user && user.id) {
                loadDashboardReviews(user.id);
            }
        });
    });
}


function setupReviewPaginationListeners() {
    document.getElementById('prevReviewPage')?.addEventListener('click', () => {
        if (reviewsCurrentPage > 1) {
            reviewsCurrentPage--;
            const user = auth.getCurrentUser();
            if (user && user.id) {
                loadDashboardReviews(user.id);
            }
        }
    });

    document.getElementById('nextReviewPage')?.addEventListener('click', () => {
        reviewsCurrentPage++;
        const user = auth.getCurrentUser();
        if (user && user.id) {
            loadDashboardReviews(user.id);
        }
    });
}


function updateProfileInfo(lawyer) {
    const nameElement = document.querySelector('.profile-info h1');
    const specialtyElement = document.querySelector('.profile-info .specialty');
    
    if (nameElement) {
        nameElement.textContent = lawyer.name;
    }
    
    if (specialtyElement) {
        specialtyElement.textContent = Array.isArray(lawyer.specialty) 
            ? lawyer.specialty.join(', ') 
            : lawyer.specialty || '';
    }
}

function renderDashboardReviews(reviews) {
    const reviewsList = document.querySelector('.reviews-list');
    
    if (!reviews?.length) {
        reviewsList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #64748b;">
                No reviews found for the selected filter.
            </div>
        `;
        return;
    }

    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        ${review.reviewer_name?.[0] || 'A'}
                    </div>
                    <div class="reviewer-details">
                        <div class="reviewer-name">${review.reviewer_name || 'Anonymous'}</div>
                        <div class="review-date">${ui.formatRelativeTime(review.created_at)}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${ui.formatRatingStars(review.rating)}
                </div>
            </div>
            <div class="review-content">
                ${review.comment}
            </div>
        </div>
    `).join('');
}


function updateReviewPagination(total) {
    const prevBtn = document.getElementById('prevReviewPage');
    const nextBtn = document.getElementById('nextReviewPage');
    
    if (prevBtn && nextBtn) {
        prevBtn.disabled = reviewsCurrentPage === 1;
        nextBtn.disabled = reviewsCurrentPage * REVIEWS_PER_PAGE >= total;
    }
}



async function loadDashboardData() {
    try {
        const token = auth.getToken();
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('/api/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        if (!data.lawyer) {
            throw new Error('No lawyer data found');
        }

        // Update profile information
        updateProfileInfo(data.lawyer);
        
        // Update ratings and badges
        updateBadges(data.lawyer.badges);
        updateProgressCircle(data.lawyer.reward_points);
        updateTierProgress(data.lawyer.reward_tier, data.lawyer.reward_points);
        
        // Load reviews using the JWT user ID
        const user = auth.getCurrentUser();
        if (user && user.id) {
            await loadDashboardReviews(user.id);
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        const reviewsList = document.querySelector('.reviews-list');
        if (reviewsList) {
            reviewsList.innerHTML = `
                <div class="error-message">
                    Failed to load dashboard data. Please try again later.
                </div>
            `;
        }
    }
}

// Update progress circle
function updateProgressCircle(points) {
    const circle = document.querySelector('.progress-ring-circle');
    const pointsDisplay = document.querySelector('.progress-text .value');
    
    if (circle && pointsDisplay) {
        const radius = circle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        
        // Calculate max points for top tier (800)
        const maxPoints = 800;
        const progress = Math.min(points / maxPoints, 1);
        const offset = circumference - progress * circumference;
        
        circle.style.strokeDashoffset = offset;
        pointsDisplay.textContent = points;
    }
}

// Update tier progress bar
function updateTierProgress(currentTier, points) {
    const tierMarkers = document.querySelectorAll('.tier-marker');
    const progressFill = document.querySelector('.tier-progress-fill');
    
    // Tier thresholds
    const tiers = {
        'standard': 0,
        'silver': 150,
        'gold': 300,
        'platinum': 500
    };
    
    const maxPoints = 800;
    const progress = Math.min(points / maxPoints, 1) * 100;
    
    // Update progress bar fill
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    // Update markers
    if (tierMarkers) {
        const tierValues = Object.values(tiers);
        tierMarkers.forEach((marker, index) => {
            marker.classList.remove('active', 'current');
            
            const tierThreshold = tierValues[index] / maxPoints * 100;
            
            if (progress >= tierThreshold) {
                marker.classList.add('active');
            }
            
            // Mark current tier
            if (currentTier === Object.keys(tiers)[index]) {
                marker.classList.add('current');
            }
        });
    }
}

// Update badges
function updateBadges(badges) {
    const badgesGrid = document.querySelector('.badges-grid');
    
    if (badgesGrid && badges && badges.length > 0) {
        const badgeIcons = {
            'Top Rated': 'fa-star',
            'Client Favorite': 'fa-heart',
            'Rising Star': 'fa-rocket',
            'Experienced Pro': 'fa-users',
            'Perfect Score': 'fa-check-circle',
            'Quick Responder': 'fa-bolt',
            'Case Winner': 'fa-trophy',
            'Top 10%': 'fa-crown'
        };
        
        const badgeDescriptions = {
            'Top Rated': 'Consistently high ratings from clients',
            'Client Favorite': 'High satisfaction from 20+ clients',
            'Rising Star': 'Exceptional performance as a newer lawyer',
            'Experienced Pro': 'Served 30+ clients successfully',
            'Perfect Score': 'Multiple 5-star reviews',
            'Quick Responder': 'Fast response to client inquiries',
            'Case Winner': 'High success rate in cases',
            'Top 10%': 'Among the top 10% of lawyers on the platform'
        };
        
        badgesGrid.innerHTML = badges.map(badge => `
            <div class="badge-item">
                <div class="badge-icon">
                    <i class="fas ${badgeIcons[badge] || 'fa-award'}"></i>
                </div>
                <h4 class="badge-name">${badge}</h4>
                <p class="badge-description">${badgeDescriptions[badge] || 'Recognition for excellent service'}</p>
            </div>
        `).join('');
    }
}

// Load recent activity
async function loadRecentActivity(lawyerId) {
    const activityList = document.querySelector('.activity-list');
    
    // This would typically come from API, but we'll simulate for now
    const activities = [
        {
            type: 'review',
            title: 'New 5-star Review',
            description: 'You received a new 5-star review from John D.',
            time: '2 days ago'
        },
        {
            type: 'badge',
            title: 'Badge Earned',
            description: 'You earned the \'Client Favorite\' badge!',
            time: '1 week ago'
        },
        {
            type: 'tier',
            title: 'Tier Upgrade',
            description: 'Congratulations! You\'ve been promoted to Platinum tier.',
            time: '2 weeks ago'
        },
        {
            type: 'review',
            title: 'New 4-star Review',
            description: 'You received a new 4-star review from Emily T.',
            time: '3 weeks ago'
        }
    ];
    
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.type === 'review' ? 'star' : activity.type === 'badge' ? 'award' : 'crown'}"></i>
                </div>
                <div class="activity-info">
                    <h4 class="activity-title">${activity.title}</h4>
                    <p class="activity-description">${activity.description}</p>
                </div>
                <div class="activity-time">
                    ${activity.time}
                </div>
            </div>
        `).join('');
    }
}
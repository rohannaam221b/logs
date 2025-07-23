// Story progression functionality
class StoryViewer {
    constructor() {
        this.currentStory = 2; // 0-based index (3rd story is active)
        this.totalStories = 10;
        this.storyDuration = 5000; // 5 seconds per story
        this.progressInterval = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startStoryProgress();
    }

    setupEventListeners() {
        // Analytics button click
        const analyticsButton = document.querySelector('.analytics-button');
        analyticsButton.addEventListener('click', this.showAnalytics.bind(this));

        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('click', () => this.handleNavigation(index));
        });

        // Story navigation (tap left/right)
        const container = document.querySelector('.mobile-container');
        container.addEventListener('click', this.handleStoryNavigation.bind(this));

        // Hashtag interactions
        const hashtags = document.querySelectorAll('.hashtag');
        hashtags.forEach(hashtag => {
            hashtag.addEventListener('click', (e) => {
                this.handleHashtagClick(e.target.textContent);
            });
        });

        // Bookmark functionality
        const bookmarkIcon = document.querySelector('.bookmark-icon');
        bookmarkIcon.addEventListener('click', this.toggleBookmark.bind(this));
    }

    startStoryProgress() {
        const activeProgressBar = document.querySelector('.progress-bar.active');
        if (activeProgressBar) {
            // Reset animation
            activeProgressBar.style.animation = 'none';
            activeProgressBar.offsetHeight; // Trigger reflow
            activeProgressBar.style.animation = `progress ${this.storyDuration / 1000}s linear`;
        }

        // Auto-advance to next story
        this.progressInterval = setTimeout(() => {
            this.nextStory();
        }, this.storyDuration);
    }

    nextStory() {
        if (this.currentStory < this.totalStories - 1) {
            this.currentStory++;
            this.updateStoryView();
        } else {
            this.showStoryComplete();
        }
    }

    previousStory() {
        if (this.currentStory > 0) {
            this.currentStory--;
            this.updateStoryView();
        }
    }

    updateStoryView() {
        // Clear existing interval
        if (this.progressInterval) {
            clearTimeout(this.progressInterval);
        }

        // Update progress bars
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach((bar, index) => {
            bar.classList.remove('completed', 'active');
            if (index < this.currentStory) {
                bar.classList.add('completed');
            } else if (index === this.currentStory) {
                bar.classList.add('active');
            }
        });

        // Update story counter
        document.querySelector('.story-counter').textContent = `${this.currentStory + 1}/${this.totalStories}`;

        // Update content based on story
        this.updateStoryContent();

        // Start progress for new story
        this.startStoryProgress();
    }

    updateStoryContent() {
        const stories = [
            {
                title: "Mumbai Innovation Center",
                text: "Mumbai facility launches revolutionary IoT solutions for smart homes with 50% energy savings and seamless connectivity.",
                hashtags: ["#Mumbai", "#IoT", "#SmartHome"]
            },
            {
                title: "Delhi Manufacturing Hub",
                text: "Delhi plant achieves carbon neutrality milestone with 100% renewable energy integration and zero-waste manufacturing.",
                hashtags: ["#Delhi", "#Sustainability", "#Manufacturing"]
            },
            {
                title: "Bangalore Tech Hub",
                text: "Bangalore R&D center achieves breakthrough in energy efficiency with 40% power reduction technology. Next-generation BLDC motors set new industry standards.",
                hashtags: ["#Bangalore", "#Innovation", "#Energy"]
            },
            {
                title: "Chennai Automation Center",
                text: "Chennai facility introduces AI-powered quality control systems, reducing defects by 60% and improving production efficiency.",
                hashtags: ["#Chennai", "#AI", "#Quality"]
            },
            {
                title: "Pune Research Lab",
                text: "Pune lab develops next-gen battery technology with 200% longer life and faster charging capabilities for electric vehicles.",
                hashtags: ["#Pune", "#Battery", "#ElectricVehicles"]
            }
        ];

        const story = stories[this.currentStory] || stories[2]; // Default to Bangalore story
        
        document.querySelector('.main-title').textContent = story.title;
        document.querySelector('.story-text').textContent = story.text;
        
        const hashtagsContainer = document.querySelector('.hashtags');
        const bookmarkIcon = hashtagsContainer.querySelector('.bookmark-icon');
        hashtagsContainer.innerHTML = '';
        
        story.hashtags.forEach(hashtag => {
            const span = document.createElement('span');
            span.className = 'hashtag';
            span.textContent = hashtag;
            span.addEventListener('click', (e) => this.handleHashtagClick(hashtag));
            hashtagsContainer.appendChild(span);
        });
        
        hashtagsContainer.appendChild(bookmarkIcon);
    }

    handleStoryNavigation(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const containerWidth = rect.width;

        if (clickX < containerWidth / 3) {
            this.previousStory();
        } else if (clickX > (2 * containerWidth) / 3) {
            this.nextStory();
        }
        // Middle third doesn't navigate (for UI interactions)
    }

    showAnalytics() {
        // Simulate analytics modal
        const analytics = {
            views: Math.floor(Math.random() * 10000) + 5000,
            engagement: Math.floor(Math.random() * 100) + 50,
            shares: Math.floor(Math.random() * 500) + 100,
            clicks: Math.floor(Math.random() * 1000) + 200
        };

        const modal = document.createElement('div');
        modal.className = 'analytics-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>📊 Story Analytics</h3>
                <div class="analytics-grid">
                    <div class="metric">
                        <span class="metric-value">${analytics.views.toLocaleString()}</span>
                        <span class="metric-label">Views</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${analytics.engagement}%</span>
                        <span class="metric-label">Engagement</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${analytics.shares}</span>
                        <span class="metric-label">Shares</span>
                    </div>
                    <div class="metric">
                        <span class="metric-value">${analytics.clicks}</span>
                        <span class="metric-label">Clicks</span>
                    </div>
                </div>
                <button class="close-modal">Close</button>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .analytics-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
            }
            .modal-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                border-radius: 20px;
                color: white;
                text-align: center;
                max-width: 300px;
                width: 90%;
            }
            .analytics-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            .metric {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .metric-value {
                font-size: 24px;
                font-weight: bold;
            }
            .metric-label {
                font-size: 14px;
                opacity: 0.8;
            }
            .close-modal {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                cursor: pointer;
                margin-top: 20px;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(modal);

        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }
        });
    }

    handleNavigation(index) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to clicked item
        document.querySelectorAll('.nav-item')[index].classList.add('active');

        // Simulate navigation feedback
        this.showToast(`Navigated to section ${index + 1}`);
    }

    handleHashtagClick(hashtag) {
        this.showToast(`Searching for ${hashtag}...`);
        // In a real app, this would navigate to hashtag search results
    }

    toggleBookmark() {
        const bookmarkIcon = document.querySelector('.bookmark-icon');
        const isBookmarked = bookmarkIcon.classList.contains('bookmarked');
        
        if (isBookmarked) {
            bookmarkIcon.textContent = '🔖';
            bookmarkIcon.classList.remove('bookmarked');
            this.showToast('Removed from bookmarks');
        } else {
            bookmarkIcon.textContent = '📌';
            bookmarkIcon.classList.add('bookmarked');
            this.showToast('Added to bookmarks');
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 1000;
            font-size: 14px;
            animation: fadeInOut 2s ease;
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                50% { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
                document.head.removeChild(style);
            }
        }, 2000);
    }

    showStoryComplete() {
        this.showToast('All stories viewed! 🎉');
        // Reset to first story
        setTimeout(() => {
            this.currentStory = 0;
            this.updateStoryView();
        }, 2000);
    }
}

// Initialize the story viewer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StoryViewer();
});

// Add some interactive feedback for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button, .nav-item, .hashtag');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                if (this.contains(ripple)) {
                    this.removeChild(ripple);
                }
            }, 600);
        });
    });

    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});
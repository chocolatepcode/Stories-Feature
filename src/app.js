// Stories Feature - Main Application Logic

const STORAGE_KEY = 'stories_data';
const STORY_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_IMAGE_WIDTH = 1080;
const MAX_IMAGE_HEIGHT = 1920;

// DOM Elements
const storiesList = document.getElementById('storiesList');
const addStoryBtn = document.getElementById('addStoryBtn');
const storyViewer = document.getElementById('storyViewer');
const closeViewer = document.getElementById('closeViewer');
const storyImage = document.getElementById('storyImage');
const storyViewerName = document.getElementById('storyViewerName');
const storyViewerTime = document.getElementById('storyViewerTime');
const prevStory = document.getElementById('prevStory');
const nextStory = document.getElementById('nextStory');
const uploadModal = document.getElementById('uploadModal');
const closeModal = document.getElementById('closeModal');
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const confirmUpload = document.getElementById('confirmUpload');

// State
let stories = [];
let currentStoryIndex = 0;
let storyProgressTimer = null;
let touchStartX = 0;
let touchEndX = 0;
let pendingImageBase64 = null;

// Initialize
function init() {
    loadStories();
    renderStories();
    checkExpiredStories();
    setupEventListeners();
    // Check for expired stories every minute
    setInterval(checkExpiredStories, 60000);
}

// LocalStorage Management
function loadStories() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            stories = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading stories:', e);
            stories = [];
        }
    }
}

function saveStories() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

function checkExpiredStories() {
    const now = Date.now();
    const initialLength = stories.length;
    stories = stories.filter(story => {
        const expiryTime = story.timestamp + STORY_EXPIRY_MS;
        return now < expiryTime;
    });
    
    if (stories.length !== initialLength) {
        saveStories();
        renderStories();
    }
}

// Image Processing
function resizeImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions while maintaining aspect ratio
                if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
                    const widthRatio = MAX_IMAGE_WIDTH / width;
                    const heightRatio = MAX_IMAGE_HEIGHT / height;
                    const ratio = Math.min(widthRatio, heightRatio);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Story Management
function addStory(imageBase64) {
    const story = {
        id: Date.now().toString(),
        image: imageBase64,
        timestamp: Date.now(),
        name: generateStoryName()
    };
    
    stories.push(story);
    saveStories();
    renderStories();
}

function generateStoryName() {
    const names = ['My Story', 'Story', 'Moment', 'Memory', 'Update'];
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
}

function deleteStory(id) {
    stories = stories.filter(story => story.id !== id);
    saveStories();
    renderStories();
}

// Rendering
function renderStories() {
    // Remove all existing story items except the add button
    const existingStories = storiesList.querySelectorAll('.story-item:not(.add-story)');
    existingStories.forEach(story => story.remove());
    
    // Add story items
    stories.forEach((story, index) => {
        const storyElement = createStoryElement(story, index);
        // Insert after the add button
        const addBtn = storiesList.querySelector('.add-story');
        storiesList.insertBefore(storyElement, addBtn.nextSibling);
    });
}

function createStoryElement(story, index) {
    const div = document.createElement('div');
    div.className = 'story-item has-story';
    div.dataset.index = index;
    
    const timeAgo = getTimeAgo(story.timestamp);
    
    div.innerHTML = `
        <div class="story-avatar">
            <div class="story-avatar-inner">
                <img src="${story.image}" alt="${story.name}">
            </div>
        </div>
        <span class="story-name">${story.name}</span>
    `;
    
    div.addEventListener('click', () => openStoryViewer(index));
    
    return div;
}

function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ago`;
    } else if (minutes > 0) {
        return `${minutes}m ago`;
    }
    return 'Just now';
}

// Story Viewer
function openStoryViewer(index) {
    if (stories.length === 0) return;
    
    currentStoryIndex = index;
    storyViewer.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    showStory(currentStoryIndex);
}

function closeStoryViewer() {
    storyViewer.classList.remove('active');
    document.body.style.overflow = '';
    clearTimeout(storyProgressTimer);
}

function showStory(index) {
    if (index < 0 || index >= stories.length) {
        closeStoryViewer();
        return;
    }
    
    const story = stories[index];
    storyImage.src = story.image;
    storyViewerName.textContent = story.name;
    storyViewerTime.textContent = getTimeAgo(story.timestamp);
    
    // Reset and start progress
    const progressBar = document.getElementById('progressBar');
    progressBar.innerHTML = '';
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-bar-fill';
    progressBar.appendChild(progressFill);
    
    clearTimeout(storyProgressTimer);
    storyProgressTimer = setTimeout(() => {
        nextStoryHandler();
    }, 5000);
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    prevStory.style.visibility = currentStoryIndex > 0 ? 'visible' : 'hidden';
    nextStory.style.visibility = currentStoryIndex < stories.length - 1 ? 'visible' : 'hidden';
}

function prevStoryHandler() {
    if (currentStoryIndex > 0) {
        currentStoryIndex--;
        showStory(currentStoryIndex);
    } else {
        closeStoryViewer();
    }
}

function nextStoryHandler() {
    if (currentStoryIndex < stories.length - 1) {
        currentStoryIndex++;
        showStory(currentStoryIndex);
    } else {
        closeStoryViewer();
    }
}

// Event Listeners
function setupEventListeners() {
    // Add story button
    addStoryBtn.addEventListener('click', () => {
        uploadModal.classList.add('active');
    });
    
    // Close modal
    closeModal.addEventListener('click', () => {
        uploadModal.classList.remove('active');
        resetUploadModal();
    });
    
    // Close viewer
    closeViewer.addEventListener('click', closeStoryViewer);
    
    // Navigation buttons
    prevStory.addEventListener('click', (e) => {
        e.stopPropagation();
        prevStoryHandler();
    });
    
    nextStory.addEventListener('click', (e) => {
        e.stopPropagation();
        nextStoryHandler();
    });
    
    // Click on sides to navigate
    storyViewer.addEventListener('click', (e) => {
        const rect = storyViewer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        
        if (x < width * 0.3) {
            prevStoryHandler();
        } else if (x > width * 0.7) {
            nextStoryHandler();
        }
    });
    
    // Upload area click
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });
    
    // File input change
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleFileSelect(file);
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await handleFileSelect(file);
        }
    });
    
    // Confirm upload
    confirmUpload.addEventListener('click', () => {
        if (pendingImageBase64) {
            addStory(pendingImageBase64);
            uploadModal.classList.remove('active');
            resetUploadModal();
        }
    });
    
    // Modal backdrop click
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.classList.remove('active');
            resetUploadModal();
        }
    });
    
    // Viewer backdrop click
    storyViewer.addEventListener('click', (e) => {
        if (e.target === storyViewer || e.target === storyViewer.querySelector('.story-viewer-content')) {
            closeStoryViewer();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (storyViewer.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                prevStoryHandler();
            } else if (e.key === 'ArrowRight') {
                nextStoryHandler();
            } else if (e.key === 'Escape') {
                closeStoryViewer();
            }
        }
    });
    
    // Touch events for swipe navigation
    setupTouchNavigation();
}

function setupTouchNavigation() {
    storyViewer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    storyViewer.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });
    
    storyViewer.addEventListener('touchend', () => {
        const diff = touchStartX - touchEndX;
        const threshold = 50; // Minimum swipe distance
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Swipe left - next story
                nextStoryHandler();
            } else {
                // Swipe right - previous story
                prevStoryHandler();
            }
        }
        
        touchStartX = 0;
        touchEndX = 0;
    });
}

// File handling
async function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    try {
        const resizedBase64 = await resizeImage(file);
        pendingImageBase64 = resizedBase64;
        
        // Show preview
        imagePreview.src = resizedBase64;
        uploadArea.style.display = 'none';
        previewContainer.style.display = 'block';
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
    }
}

function resetUploadModal() {
    imageInput.value = '';
    uploadArea.style.display = 'block';
    previewContainer.style.display = 'none';
    imagePreview.src = '';
    pendingImageBase64 = null;
}

// Start the application
init();
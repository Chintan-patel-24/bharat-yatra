// Global variables
let currentScreen = 'login';
let loginType = '';
let selectedSize = 0;
let members = [];
let currentEditingMember = null;
let screenHistory = ['login'];
let historyIndex = 0;
let stream = null;
let facingMode = 'environment'; // 'environment' for rear camera, 'user' for front camera

// Close welcome popup function
function closeWelcomePopup() {
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    welcomeOverlay.style.opacity = '0';
    welcomeOverlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        welcomeOverlay.style.display = 'none';
    }, 300);
}

// Close member welcome popup function
function closeMemberWelcomePopup() {
    const memberWelcomeOverlay = document.getElementById('memberWelcomeOverlay');
    memberWelcomeOverlay.style.opacity = '0';
    memberWelcomeOverlay.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        memberWelcomeOverlay.style.display = 'none';
    }, 300);
}

// Navigation functions
function handleNavigation(direction) {
    if (direction === 'back' && historyIndex > 0) {
        historyIndex--;
        showScreen(screenHistory[historyIndex]);
    } else if (direction === 'forward' && historyIndex < screenHistory.length - 1) {
        historyIndex++;
        showScreen(screenHistory[historyIndex]);
    }
    updateArrows();
}

function updateArrows() {
    const navArrows = document.getElementById('navArrows');
    const backArrow = document.querySelector('.back-arrow');
    const forwardArrow = document.querySelector('.forward-arrow');
    
    if (currentScreen === 'login' || currentScreen === 'home' || currentScreen === 'group' || currentScreen === 'camera' || currentScreen === 'chatbot') {
        navArrows.classList.remove('visible');
    } else {
        navArrows.classList.add('visible');
        backArrow.style.display = historyIndex > 0 ? 'flex' : 'none';
        forwardArrow.style.display = historyIndex < screenHistory.length - 1 ? 'flex' : 'none';
    }
}

function showScreen(screenName) {
    // Hide all screens
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('loginAsPopup').style.display = 'none';
    document.getElementById('memberPopup').style.display = 'none';
    document.getElementById('invitePopup').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('groupScreen').style.display = 'none';
    document.getElementById('cameraScreen').style.display = 'none';
    document.getElementById('chatbotScreen').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'none';
    
    // Show selected screen
    switch(screenName) {
        case 'login':
            document.getElementById('loginContainer').style.display = 'flex';
            break;
        case 'loginAs':
            document.getElementById('loginAsPopup').style.display = 'block';
            break;
        case 'memberStrength':
            document.getElementById('memberPopup').style.display = 'block';
            break;
        case 'inviteCode':
            document.getElementById('invitePopup').style.display = 'block';
            break;
        case 'home':
            document.getElementById('homeScreen').style.display = 'block';
            document.getElementById('bottomNav').style.display = 'flex';
            break;
        case 'group':
            document.getElementById('groupScreen').style.display = 'flex';
            document.getElementById('bottomNav').style.display = 'flex';
            break;
        case 'camera':
            document.getElementById('cameraScreen').style.display = 'flex';
            document.getElementById('bottomNav').style.display = 'flex';
            break;
        case 'chatbot':
            document.getElementById('chatbotScreen').style.display = 'flex';
            document.getElementById('bottomNav').style.display = 'flex';
            break;
    }
    
    currentScreen = screenName;
    updateArrows();
}

function addToHistory(screenName) {
    // If we're not at the end of history, remove future screens
    if (historyIndex < screenHistory.length - 1) {
        screenHistory = screenHistory.slice(0, historyIndex + 1);
    }
    
    screenHistory.push(screenName);
    historyIndex = screenHistory.length - 1;
}

// Login form submission - Both ID and password are lowercase
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('id').value;
    const password = document.getElementById('password').value;
    
    // Both credentials are lowercase
    if (id === 'bharat' && password === 'bharat') {
        addToHistory('loginAs');
        showScreen('loginAs');
    } else {
        showError('Invalid ID or Password');
    }
});

// Login as selection
document.getElementById('continueLoginBtn').addEventListener('click', function() {
    const selectedOption = document.querySelector('input[name="loginType"]:checked');
    
    if (selectedOption) {
        loginType = selectedOption.value;
        
        if (loginType === 'leader') {
            addToHistory('memberStrength');
            showScreen('memberStrength');
        } else {
            // For member login, show the team code popup first
            addToHistory('memberWelcome');
            document.getElementById('memberWelcomeOverlay').style.display = 'flex';
            // Add a slight delay to ensure the popup appears after the animation
            setTimeout(() => {
                document.getElementById('memberWelcomeOverlay').style.opacity = '1';
            }, 10);
        }
    } else {
        showError('Please select an option');
    }
});

// Member welcome popup handling
document.getElementById('memberWelcomeOverlay').addEventListener('click', function(e) {
    // Close popup when clicking outside the content
    if (e.target === this) {
        closeMemberWelcomePopup();
    }
});

// Member size selection
document.querySelectorAll('.size-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        
        const size = this.dataset.size;
        if (size === 'custom') {
            document.getElementById('customInput').style.display = 'block';
            document.getElementById('customNumber').focus();
        } else {
            document.getElementById('customInput').style.display = 'none';
            selectedSize = parseInt(size);
        }
    });
});

// Custom size continue
document.getElementById('customContinueBtn').addEventListener('click', function() {
    const customValue = document.getElementById('customNumber').value;
    
    if (customValue && customValue > 0) {
        selectedSize = parseInt(customValue);
        createMembers(selectedSize);
        addToHistory('home');
        showScreen('home');
    } else {
        showError('Please enter a valid number');
    }
});

// Invite code continue
document.getElementById('inviteContinueBtn').addEventListener('click', function() {
    const code = document.getElementById('inviteCode').value;
    
    if (code === '108') {
        createMembers(8);
        addToHistory('home');
        showScreen('home');
    } else {
        showError('Invalid invite code');
    }
});

// Create members
function createMembers(count) {
    const container = document.getElementById('membersContainer');
    container.innerHTML = '';
    members = [];
    
    for (let i = 1; i <= count; i++) {
        const member = {
            id: `M${i.toString().padStart(3, '0')}`,
            name: `Member ${i}`,
            mobile: ''
        };
        members.push(member);
        
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member-oval';
        memberDiv.textContent = member.name;
        memberDiv.addEventListener('click', () => showEditPopup(i - 1));
        container.appendChild(memberDiv);
    }
    
    // Show find group option if leader
    if (loginType === 'leader') {
        document.getElementById('findGroupOption').style.display = 'block';
    }
}

// Show edit popup
function showEditPopup(index) {
    currentEditingMember = index;
    const member = members[index];
    
    document.getElementById('editId').value = member.id;
    document.getElementById('editName').value = member.name;
    document.getElementById('editMobile').value = member.mobile;
    document.getElementById('editPopup').style.display = 'block';
}

// Close edit popup
function closeEditPopup() {
    document.getElementById('editPopup').style.display = 'none';
}

// Save changes
document.getElementById('saveChangesBtn').addEventListener('click', function() {
    if (currentEditingMember !== null) {
        const name = document.getElementById('editName').value.trim();
        const mobile = document.getElementById('editMobile').value.trim();
        
        if (name) {
            members[currentEditingMember].name = name;
            members[currentEditingMember].mobile = mobile;
            
            // Update the member oval
            const memberOvals = document.querySelectorAll('.member-oval');
            memberOvals[currentEditingMember].textContent = name;
            
            closeEditPopup();
        } else {
            showError('Name cannot be empty');
        }
    }
});

// Bottom navigation
document.getElementById('homeOption').addEventListener('click', function() {
    document.querySelectorAll('.nav-option').forEach(opt => opt.classList.remove('active'));
    this.classList.add('active');
    showScreen('home');
});

document.getElementById('groupOption').addEventListener('click', function() {
    document.querySelectorAll('.nav-option').forEach(opt => opt.classList.remove('active'));
    this.classList.add('active');
    showScreen('group');
});

document.getElementById('cameraOption').addEventListener('click', function() {
    document.querySelectorAll('.nav-option').forEach(opt => opt.classList.remove('active'));
    this.classList.add('active');
    showScreen('camera');
});

document.getElementById('chatbotOption').addEventListener('click', function() {
    document.querySelectorAll('.nav-option').forEach(opt => opt.classList.remove('active'));
    this.classList.add('active');
    showScreen('chatbot');
});

// Camera functionality
document.getElementById('takePhotoOption').addEventListener('click', function() {
    openCamera();
});

document.getElementById('uploadPhotoOption').addEventListener('click', function() {
    document.getElementById('uploadInput').click();
});

// Handle upload input
document.getElementById('uploadInput').addEventListener('change', function(e) {
    handleImageSelection(e.target.files[0]);
});

// Open camera using MediaDevices API
function openCamera() {
    const constraints = {
        video: {
            facingMode: facingMode
        }
    };
    
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(mediaStream) {
            stream = mediaStream;
            const video = document.getElementById('cameraVideo');
            video.srcObject = stream;
            document.getElementById('cameraView').style.display = 'block';
        })
        .catch(function(err) {
            console.error('Error accessing camera: ', err);
            showError('Unable to access camera. Please check permissions.');
        });
}

// Close camera
document.getElementById('closeCameraBtn').addEventListener('click', function() {
    closeCamera();
});

function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => {
            track.stop();
        });
        stream = null;
    }
    document.getElementById('cameraView').style.display = 'none';
}

// Capture photo
document.getElementById('captureBtn').addEventListener('click', function() {
    capturePhoto();
});

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob (image file)
    canvas.toBlob(function(blob) {
        closeCamera();
        handleImageSelection(blob);
    }, 'image/jpeg');
}

// Switch camera
document.getElementById('switchCameraBtn').addEventListener('click', function() {
    switchCamera();
});

function switchCamera() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    closeCamera();
    openCamera();
}

// Handle image selection
function handleImageSelection(file) {
    if (file) {
        // Simulate processing time
        setTimeout(() => {
            showCameraResultPopup();
        }, 1500);
    }
}

// Show camera result popup
function showCameraResultPopup() {
    document.getElementById('cameraResultPopup').style.display = 'block';
}

// Close camera result popup
function closeCameraResultPopup() {
    document.getElementById('cameraResultPopup').style.display = 'none';
}

// Retry camera action
function retryCameraAction() {
    closeCameraResultPopup();
    // Reset file input
    document.getElementById('uploadInput').value = '';
}

// More menu
document.getElementById('moreOption').addEventListener('click', function() {
    const moreMenu = document.getElementById('moreMenu');
    moreMenu.style.display = moreMenu.style.display === 'block' ? 'none' : 'block';
});

// Login as option in more menu
document.getElementById('loginAsOption').addEventListener('click', function() {
    document.getElementById('moreMenu').style.display = 'none';
    addToHistory('loginAs');
    showScreen('loginAs');
});

// Close more menu when clicking outside
document.addEventListener('click', function(e) {
    const moreMenu = document.getElementById('moreMenu');
    const moreOption = document.getElementById('moreOption');
    
    if (!moreMenu.contains(e.target) && !moreOption.contains(e.target)) {
        moreMenu.style.display = 'none';
    }
});

// Error popup
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorPopup').style.display = 'block';
}

function closeErrorPopup() {
    document.getElementById('errorPopup').style.display = 'none';
}

// Initialize
showScreen('login');

// Add event listener for the member welcome popup
document.getElementById('memberWelcomeOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeMemberWelcomePopup();
    }
});

// ========================================
// GLOBAL VARIABLES
// ========================================
let currentScreen = 'login';
let loginType = '';
let selectedSize = 0;
let members = [];
let currentEditingMember = null;
let screenHistory = ['login'];
let historyIndex = 0;
let stream = null;
let facingMode = 'environment';

// ========================================
// WELCOME POPUP FUNCTIONS
// ========================================
function closeWelcomePopup() {
    const popup = document.getElementById('welcomePopup');
    const overlay = document.getElementById('welcomeOverlay');
    
    popup.classList.add('closing');
    overlay.classList.add('closing');
    
    setTimeout(() => {
        popup.style.display = 'none';
        overlay.style.display = 'none';
    }, 500);
}

function copyCredential(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showCopyToast();
    }).catch(err => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyToast();
    });
}

function showCopyToast() {
    const toast = document.getElementById('copyToast');
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// ========================================
// NAVIGATION FUNCTIONS
// ========================================
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
    if (historyIndex < screenHistory.length - 1) {
        screenHistory = screenHistory.slice(0, historyIndex + 1);
    }
    
    screenHistory.push(screenName);
    historyIndex = screenHistory.length - 1;
}

// ========================================
// LOGIN FUNCTIONS
// ========================================
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = document.getElementById('id').value;
    const password = document.getElementById('password').value;
    
    // Both ID and password are lowercase: bharat
    if (id === 'bharat' && password === 'bharat') {
        addToHistory('loginAs');
        showScreen('loginAs');
    } else {
        showError('Invalid ID or Password');
    }
});

document.getElementById('continueLoginBtn').addEventListener('click', function() {
    const selectedOption = document.querySelector('input[name="loginType"]:checked');
    
    if (selectedOption) {
        loginType = selectedOption.value;
        
        if (loginType === 'leader') {
            addToHistory('memberStrength');
            showScreen('memberStrength');
        } else {
            addToHistory('inviteCode');
            showScreen('inviteCode');
        }
    } else {
        showError('Please select an option');
    }
});

// ========================================
// MEMBER SIZE SELECTION
// ========================================
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

// ========================================
// MEMBER MANAGEMENT
// ========================================
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
        memberDiv.style.animationDelay = `${i * 0.1}s`;
        memberDiv.addEventListener('click', () => showEditPopup(i - 1));
        container.appendChild(memberDiv);
    }
    
    if (loginType === 'leader') {
        document.getElementById('findGroupOption').style.display = 'block';
    }
}

function showEditPopup(index) {
    currentEditingMember = index;
    const member = members[index];
    
    document.getElementById('editId').value = member.id;
    document.getElementById('editName').value = member.name;
    document.getElementById('editMobile').value = member.mobile;
    document.getElementById('editPopup').style.display = 'block';
}

function closeEditPopup() {
    document.getElementById('editPopup').style.display = 'none';
}

document.getElementById('saveChangesBtn').addEventListener('click', function() {
    if (currentEditingMember !== null) {
        const name = document.getElementById('editName').value.trim();
        const mobile = document.getElementById('editMobile').value.trim();
        
        if (name) {
            members[currentEditingMember].name = name;
            members[currentEditingMember].mobile = mobile;
            
            const memberOvals = document.querySelectorAll('.member-oval');
            memberOvals[currentEditingMember].textContent = name;
            
            closeEditPopup();
        } else {
            showError('Name cannot be empty');
        }
    }
});

// ========================================
// BOTTOM NAVIGATION
// ========================================
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

// ========================================
// CAMERA FUNCTIONALITY
// ========================================
document.getElementById('takePhotoOption').addEventListener('click', function() {
    openCamera();
});

document.getElementById('uploadPhotoOption').addEventListener('click', function() {
    document.getElementById('uploadInput').click();
});

document.getElementById('uploadInput').addEventListener('change', function(e) {
    handleImageSelection(e.target.files[0]);
});

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

document.getElementById('captureBtn').addEventListener('click', function() {
    capturePhoto();
});

function capturePhoto() {
    const video = document.getElementById('cameraVideo');
    const canvas = document.getElementById('cameraCanvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(function(blob) {
        closeCamera();
        handleImageSelection(blob);
    }, 'image/jpeg');
}

document.getElementById('switchCameraBtn').addEventListener('click', function() {
    switchCamera();
});

function switchCamera() {
    facingMode = facingMode === 'environment' ? 'user' : 'environment';
    closeCamera();
    openCamera();
}

function handleImageSelection(file) {
    if (file) {
        setTimeout(() => {
            showCameraResultPopup();
        }, 1500);
    }
}

function showCameraResultPopup() {
    document.getElementById('cameraResultPopup').style.display = 'block';
}

function closeCameraResultPopup() {
    document.getElementById('cameraResultPopup').style.display = 'none';
}

function retryCameraAction() {
    closeCameraResultPopup();
    document.getElementById('uploadInput').value = '';
}

// ========================================
// MORE MENU
// ========================================
document.getElementById('moreOption').addEventListener('click', function() {
    const moreMenu = document.getElementById('moreMenu');
    moreMenu.style.display = moreMenu.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('loginAsOption').addEventListener('click', function() {
    document.getElementById('moreMenu').style.display = 'none';
    addToHistory('loginAs');
    showScreen('loginAs');
});

document.addEventListener('click', function(e) {
    const moreMenu = document.getElementById('moreMenu');
    const moreOption = document.getElementById('moreOption');
    
    if (!moreMenu.contains(e.target) && !moreOption.contains(e.target)) {
        moreMenu.style.display = 'none';
    }
});

// ========================================
// ERROR POPUP
// ========================================
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorPopup').style.display = 'block';
}

function closeErrorPopup() {
    document.getElementById('errorPopup').style.display = 'none';
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Show welcome popup on page load
    document.getElementById('welcomePopup').style.display = 'block';
    document.getElementById('welcomeOverlay').style.display = 'block';
    
    // Welcome button click handler
    document.getElementById('welcomeBtn').addEventListener('click', closeWelcomePopup);
    
    // Initialize the app
    showScreen('login');
});

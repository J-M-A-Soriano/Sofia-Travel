/* --- PROFESSIONAL NOTIFICATION SYSTEM (Top-Right) --- */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    
    // Create element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Determine Icon and Title based on type
    let iconClass = 'fa-circle-info';
    let title = 'Information';
    
    if(type === 'success') {
        iconClass = 'fa-circle-check';
        title = 'Success';
    }
    if(type === 'error') {
        iconClass = 'fa-circle-exclamation';
        title = 'Error';
    }

    // Professional HTML Structure
    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);

    // Auto Remove after 4 seconds
    setTimeout(() => {
        // Check if element still exists (user might have clicked close)
        if(toast.parentElement) {
            toast.style.animation = 'fadeOutRight 0.5s ease forwards';
            setTimeout(() => {
                if(toast.parentElement) toast.remove();
            }, 500);
        }
    }, 4000);
}

/* --- PAYMENT LOGIC START --- */

let currentPaymentMethod = 'card'; // Default
let pendingPkg = null;
let pendingDetails = null;

// Helper: Auto-format Credit Card (XXXX XXXX XXXX XXXX)
function formatCardInput(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    value = value.substring(0, 16); // Max 16 digits
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
        parts.push(value.substring(i, i + 4));
    }
    input.value = parts.join(' ');
}

// Helper: Switch Tabs
function selectPaymentMethod(method) {
    currentPaymentMethod = method;
    
    // Update Visuals
    document.querySelectorAll('.pay-method-card').forEach(el => el.classList.remove('active'));
    document.getElementById(`pm-${method}`).classList.add('active');
    
    // Update Form Content
    const container = document.getElementById('paymentFormInputs');
    if (method === 'card') {
        container.innerHTML = `
            <div class="checkout-input-group">
                <label>Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" oninput="formatCardInput(this)" maxlength="19" required>
            </div>
            <div class="checkout-input-group">
                <label>Cardholder Name</label>
                <input type="text" placeholder="Name as on card" style="font-family:inherit;" required>
            </div>
            <div class="row">
                <div class="checkout-input-group" style="flex:1">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" maxlength="5" required>
                </div>
                <div class="checkout-input-group" style="flex:1">
                    <label>CVV / CVC</label>
                    <input type="password" placeholder="123" maxlength="3" required>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:15px; border-radius:8px; margin-bottom:20px; text-align:center;">
                <p style="margin:0; color:#166534; font-size:0.9rem;">
                    <i class="fa-solid fa-shield-halved"></i> Secure connection to <strong>${method.toUpperCase()}</strong>
                </p>
            </div>
            <div class="checkout-input-group">
                <label>Mobile Number</label>
                <input type="text" placeholder="09XX XXX XXXX" maxlength="11" style="font-size:1.2rem; font-weight:bold;" required>
            </div>
            <p class="small muted">You will receive an OTP on your mobile device to complete this transaction.</p>
        `;
    }
}


// Data and State Management
const EXCHANGE_RATE = 56;

// Dashboard active tab state
let currentDashboardTab = 'overview'; // overview, history, wishlist, profile

// Additional Images for Gallery (Mock Database)
const galleryImages = {
    'BOR': ['https://tripwis.com/wp-content/uploads/2023/01/sunset-in-boracay.jpg', 'https://tripwis.com/wp-content/uploads/2023/01/Boracays-nightlife.jpg', 'https://tripwis.com/wp-content/uploads/2023/01/Coast-village.jpg', 'https://tripwis.com/wp-content/uploads/2023/01/Station-3.jpg'],
    'PPC': ['https://thehappytrip.com/wp-content/uploads/2018/08/1024px-Puerto_Princesa_Subterranean_River_National_park_01.jpg', 'https://d2lwt6tidfiof0.cloudfront.net/images/background/bg-philippines.jpg', 'https://images.squarespace-cdn.com/content/v1/600f9ebc5dde0207fd5fef45/625a5557-52a1-43c4-8dfe-0143646b59c9/ug+%282%29.jpg'],
    'CHH': ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Chocolate_Hills_Bohol.JPG/1200px-Chocolate_Hills_Bohol.JPG', 'https://www.tripsavvy.com/thmb/Jzabkhf4XiCWze_Kqaf5rFdr8vc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/hot_air_balloon-57c2ae8360904730a774c49d2dbf70dd.jpg', 'https://image.kkday.com/v2/image/get/s1.kkday.com/product_249630/20240917171808_iYdkS/jpg'],
    'VIG': ['https://www.awanderfulsole.com/wp-content/uploads/2016/12/tumblr_n90a64f1l01rs8bs1o4_128.jpg', 'https://content.skyscnr.com/m/6fc842816afc371b/original/GettyImages-539019147.jpg?resize=1224%3Aauto', 'https://groupgarcia.weebly.com/uploads/5/7/0/1/57010307/4739743_orig.jpg'],
    'TAG': ['https://www.thepoortraveler.net/wp-content/uploads/2020/12/Peoples-Park-in-the-Sky.jpg', 'https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/07/01/6b27056fe46f55c63017b97e8c02bb81_1000x1000.jpg', 'https://ik.imagekit.io/tvlk/blog/2023/07/shutterstock_1898972338-3.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2'],
    'ELN': ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/cb/a6/63/re-discovering-my-fave.jpg?w=1200&h=700&s=1', 'https://www.travel-palawan.com/wp-content/uploads/2018/02/Limeston-rocks-Bacuit-bay-El-Nidou-jpg-768x512.jpg', 'https://www.vacationhive.com/images/hives/2/2-el-nido-gallery-img3.jpg'],
    'CEB': ['https://i0.wp.com/zimminaroundtheworld.com/wp-content/uploads/2024/08/DSC_5490.jpg?resize=1024%2C683&ssl=1', 'https://www.jonnymelon.com/wp-content/uploads/2019/09/kawasan-falls-canyoneering-24.jpg', 'https://www.jonnymelon.com/wp-content/uploads/2019/10/sumilon-island-cebu-30.jpg'],
    'SGO': ['https://thefroggyadventures.com/wp-content/uploads/2024/10/maasin-river-siargao.jpg', 'https://www.jonnymelon.com/wp-content/uploads/2018/10/guyam-island-8.jpg', 'https://www.jonnymelon.com/wp-content/uploads/2018/10/tayangban-cave-e1540759628186.jpg'],
    'BTN': ['https://ik.imagekit.io/tvlk/blog/2018/09/Valugan-Boulder-Beach-Batanes.jpg?tr=q-70,c-at_max,w-1000,h-600', 'https://ik.imagekit.io/tvlk/blog/2018/09/Basco-Lighthouse-Batanes.jpg?tr=q-70,c-at_max,w-1000,h-600', 'https://ik.imagekit.io/tvlk/blog/2018/09/Marlboro-Country-Batanes.jpg?tr=q-70,c-at_max,w-1000,h-600'],
    'CMG': ['https://philippinetravels.ph/wp-content/uploads/2022/08/02-Camiguin-Tourist-Spots-Sto-Nino-Cold-Spring-1024x576.jpg', 'https://philippinetravels.ph/wp-content/uploads/2022/08/08-Camiguin-Tourist-Spots-Other-Side-of-Mantigue-1024x576.jpg', 'https://philippinetravels.ph/wp-content/uploads/2022/08/12-Camiguin-Tourist-Spots-Katibawasan-Falls-1024x576.jpg'],
    'BGU': ['https://www.thepoortraveler.net/wp-content/uploads/2021/01/Igorot-Stone-Kingdom.jpg', 'https://www.thepoortraveler.net/wp-content/uploads/2014/01/Camp-John-Hay-Table-Rental.jpg', 'https://www.thepoortraveler.net/wp-content/uploads/2019/04/Stobosa-Colorful-Houses-Baguio.jpg'],
    'DMG': ['https://www.jonnymelon.com/wp-content/uploads/2018/10/dumaguete-tourist-spots-2.jpg', 'https://www.jonnymelon.com/wp-content/uploads/2018/10/dumaguete-tourist-spots-15.jpg', 'https://www.jonnymelon.com/wp-content/uploads/2018/10/dumaguete-tourist-spots-12.jpg']
};

// Merging Coordinates and Attractions from Wow.html
const mapData = {
    'BOR': { 
        coords: [11.9674, 121.9248], 
        attractions: [{name:'White Beach', lat:11.960, lng:121.924}, {name:'Puka Beach', lat:11.986, lng:121.914}],
        hotels: [{name:'Shangri-La Boracay', lat:11.980, lng:121.910}, {name:'The Lind', lat:11.970, lng:121.918}]
    },
    'PPC': { 
        coords: [9.7392, 118.7353], 
        attractions: [{name:'Underground River', lat:10.192, lng:118.891}],
        hotels: [{name:'Princesa Garden', lat:9.740, lng:118.740}, {name:'Hue Hotels', lat:9.745, lng:118.738}]
    },
    // ... add similar structure for other destinations if needed ...
    'CEB': { coords: [10.3157, 123.8854], attractions: [], hotels: [] }, 
    'BGU': { coords: [16.4023, 120.5960], attractions: [], hotels: [] },
    'ELN': { coords: [11.1667, 119.3833], attractions: [], hotels: [] },
    'SGO': { coords: [9.8540, 126.0468], attractions: [], hotels: [] },
    'BTN': { coords: [20.4485, 121.9708], attractions: [], hotels: [] },
    'TAG': { coords: [14.1153, 120.9621], attractions: [], hotels: [] },
    'VIG': { coords: [17.5706, 120.3869], attractions: [], hotels: [] },
    'CHH': { coords: [9.8297, 124.1398], attractions: [], hotels: [] },
    'CMG': { coords: [9.1732, 124.7299], attractions: [], hotels: [] },
    'DMG': { coords: [9.3068, 123.3054], attractions: [], hotels: [] }
};

/* --- UPDATE: REALISTIC PHILIPPINE PESO PRICES --- */
const state = {
  // ... keep ratings, comments, user, bookings, wishlist ...
  ratings: {},      
  comments: {},     
  user: null,
  bookings: [],
  wishlist: [],
  
  packages: [
    {id:1, title:'Boracay 3D/2N Beach Escape', destId:'BOR', price: 8500, type:'leisure', seats:10, description:'Beachfront hotel + island hopping + sunset cruise.'},
    {id:2, title:'Palawan Underground River Tour', destId:'PPC', price: 11200, type:'adventure', seats:8, description:'Guided cave tour + buffet lunch + city tour.'},
    {id:3, title:'Bohol Countryside & Chocolate Hills', destId:'CHH', price: 6800, type:'culture', seats:12, description:'Loboc River Cruise, Tarsier sanctuary, and Hills.'},
    {id:4, title:'Vigan Heritage Tour', destId:'VIG', price: 5500, type:'cultural', seats:15, description:'Calle Crisologo walking tour + kalesa ride.'},
    {id:5, title:'Tagaytay Day Trip', destId:'TAG', price: 3500, type:'leisure', seats:20, description:'Private van transfer + Bulalo lunch overlooking Taal.'},
    {id:6, title:'El Nido Island Hopping A & C', destId:'ELN', price: 14500, type:'adventure', seats:10, description:'Big Lagoon, Secret Beach, and snorkeling gear included.'},
    {id:7, title:'Cebu Whale Shark & Canyoneering', destId:'CEB', price: 9500, type:'adventure', seats:10, description:'Oslob interaction + Kawasan Falls adventure.'},
    {id:8, title:'Siargao Cloud 9 Surf & Stay', destId:'SGO', price: 12800, type:'adventure', seats:8, description:'Surf lessons, motorbike rental, and island hopping.'},
    {id:9, title:'Batanes Northern Hills (3D/2N)', destId:'BTN', price: 28500, type:'cultural', seats:6, description:'Full tour of North & South Batan + Sabtang Island.'},
    {id:10, title:'Camiguin Volcano & White Island', destId:'CMG', price: 7900, type:'leisure', seats:12, description:'Sunken Cemetery, Soda Springs, and White Island.'},
    {id:11, title:'Baguio Pine City Retreat', destId:'BGU', price: 4500, type:'leisure', seats:15, description:'Camp John Hay, Mines View, and Strawberry Farm.'},
    {id:12, title:'Dumaguete & Apo Island Dive', destId:'DMG', price: 10500, type:'adventure', seats:8, description:'Dolphin watching and snorkeling with sea turtles.'},
  ],
  
  destinations: [ 
      // ... keep your existing destinations list ...
      { id:'CEB', name:'Cebu City', province:'Cebu', summary:'Historic landmarks, whale watching, and vibrant city life.', rating:4.7, image:'https://media.digitalnomads.world/wp-content/uploads/2021/08/20115612/cebu-digital-nomads.jpg' },
      { id:'SGO', name:'Siargao', province:'Surigao del Norte', summary:'Surfing capital, lagoons, white sand islands, and rock pools.', rating:4.8, image:'https://images.squarespace-cdn.com/content/v1/6507df2246905b20c408b2bc/8ec7584a-76cb-4262-b4c8-fa5334bff05c/Siargao+-+title.jpg' },
      { id:'BTN', name:'Batanes', province:'Cagayan Valley', summary:'Stone houses, dramatic cliffs, rolling hills, peaceful island life.', rating:4.9, image:'https://ik.imagekit.io/tvlk/blog/2018/09/Valugan-Boulder-Beach-Batanes.jpg?tr=q-70,c-at_max,w-1000,h-600' },
      { id:'CMG', name:'Camiguin', province:'Region X', summary:'Volcanoes, hot springs, White Island sandbar, refreshing waterfalls.', rating:4.6, image:'https://lifestyle.inquirer.net/files/2023/09/camiguin-White-Island-with-Hibok-Hibok-as-background.jpeg' },
      { id:'BGU', name:'Baguio', province:'Benguet', summary:'Cool climate, pine forests, mountain views, and local arts.', rating:4.5, image:'https://visita.baguio.gov.ph/assets/images/Lions%20Head.jpg' },
      { id:'DMG', name:'Dumaguete', province:'Negros Oriental', summary:'Laid-back university town, dolphin watching, diving spots.', rating:4.6, image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3IKcaSEFSnfEK4Nl5c_6gIQmnp5Fd5nInhA&s' },
      { id:'BOR',name:'Boracay',province:'Aklan',summary:'White-sand beaches, crystal-clear waters, vibrant nightlife, and famous sunset views.',rating:4.8, image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/e795448cde308c144b5f8eead81b52a5b9a5f4e7-1600x1066.jpg'},
      { id:'PPC',name:'Puerto Princesa City',province:'Palawan',summary:'Underground river, eco-adventures, pristine beaches, and stunning limestone cliffs.',rating:4.7, image: ' https://gttp.images.tshiftcdn.com/225540/x/0/16-best-tourist-spots-amp-things-to-do-in-puerto-princesa-city-on-palawan-island-15.jpg?auto=compress%2Cformat&ch=Width%2CDPR&dpr=1&ixlib=php-3.3.0&w=883'},
      { id:'CHH',name:'Chocolate Hills',province:'Bohol',summary:'Iconic geological formations, scenic viewpoints, and nearby wildlife sanctuaries.',rating:4.6, image: 'https://carmen-bohol.gov.ph/wp-content/uploads/2024/03/Chocolate-Hills-Carmen.png'},
      { id:'VIG',name:'Vigan',province:'Ilocos Sur',summary:'Historic Spanish colonial town, cobblestone streets, and heritage architecture.',rating:4.7, image: 'https://gttp.images.tshiftcdn.com/223658/x/0/'},
      { id:'TAG',name:'Tagaytay',province:'Cavite',summary:'Cool climate, Taal Volcano view, and relaxing restaurants overlooking the lake.',rating:4.5, image: 'https://lakbaypinas.com/wp-content/uploads/2025/04/Snapins.ai_412919370_18407258452029118_3433284473692002855_n_1080.jpg'},
      { id:'ELN',name:'El Nido',province:'Palawan',summary:'Stunning limestone cliffs, hidden lagoons, and world-class snorkeling spots.',rating:4.9, image: 'https://www.travel-palawan.com/wp-content/uploads/2023/04/Hidden-Beach-Bacuit-Bay-El-Nido-1024x683.jpeg'}
  ],
  itineraries: []
};

/* --- CURRENCY CONVERSION SYSTEM --- */
const exchangeRates = {
    'PHP': 1,       // Base
    'USD': 0.018,   // 1 PHP = 0.018 USD (Approx 1 USD = 56 PHP)
    'EUR': 0.016,   // 1 PHP = 0.016 EUR
    'JPY': 2.70     // 1 PHP = 2.70 JPY
};

const currencySymbols = {
    'PHP': '₱',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥'
};

// Helper: Converts and Formats Price
function formatPrice(amountInPhp) {
    const rate = exchangeRates[state.currency] || 1;
    const converted = amountInPhp * rate;
    const symbol = currencySymbols[state.currency] || '₱';
    
    // Formatting: JPY usually has no decimals, others have 2
    const options = { 
        minimumFractionDigits: state.currency === 'JPY' ? 0 : 2,
        maximumFractionDigits: state.currency === 'JPY' ? 0 : 2 
    };
    
    return `${symbol}${converted.toLocaleString(undefined, options)}`;
}

// --- CAROUSEL LOGIC START ---
let currentGalleryList = [];
let currentGalleryIndex = 0;
let currentGalleryName = "";

function openGallery(destId) {
    const dest = state.destinations.find(d => d.id === destId);
    if (!dest) return;

    // Fallback if no specific gallery exists (uses just the main image 3 times as demo)
    currentGalleryList = galleryImages[destId] || [dest.image, dest.image, dest.image];
    currentGalleryName = dest.name;
    currentGalleryIndex = 0;

    updateGalleryView();
    document.getElementById('galleryModal').style.display = 'flex';
    
    // Add keyboard support
    document.addEventListener('keydown', handleGalleryKeys);
}

function closeGallery() {
    document.getElementById('galleryModal').style.display = 'none';
    document.removeEventListener('keydown', handleGalleryKeys);
}

function closeGalleryOnOutsideClick(e) {
    if (e.target.id === 'galleryModal' || e.target.classList.contains('gallery-container')) {
        closeGallery();
    }
}

function handleGalleryKeys(e) {
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowLeft') changeSlide(-1);
    if (e.key === 'ArrowRight') changeSlide(1);
}

function changeSlide(n) {
    currentGalleryIndex += n;
    if (currentGalleryIndex >= currentGalleryList.length) currentGalleryIndex = 0;
    if (currentGalleryIndex < 0) currentGalleryIndex = currentGalleryList.length - 1;
    updateGalleryView();
}

function jumpToSlide(index) {
    currentGalleryIndex = index;
    updateGalleryView();
}

function updateGalleryView() {
    const imgElement = document.getElementById('galleryImage');
    const captionElement = document.getElementById('galleryCaption');
    const thumbnailsContainer = document.getElementById('galleryThumbnails');

    // Fade out slightly
    imgElement.style.opacity = 0.5;
    
    setTimeout(() => {
        imgElement.src = currentGalleryList[currentGalleryIndex];
        imgElement.style.opacity = 1;
    }, 150);

    captionElement.innerText = `${currentGalleryName} — Photo ${currentGalleryIndex + 1} of ${currentGalleryList.length}`;

    // Render Thumbnails
    thumbnailsContainer.innerHTML = currentGalleryList.map((src, idx) => `
        <img src="${src}" 
             class="gallery-thumb ${idx === currentGalleryIndex ? 'active' : ''}" 
             onclick="jumpToSlide(${idx})" 
             alt="Thumbnail">
    `).join('');
}
// --- CAROUSEL LOGIC END ---

const routes = {
  '': renderHome,
  '#home': renderHome,
  '#destinations': renderDestinations,
  '#packages': renderPackages,
  '#auth': renderAuth, 
  '#dashboard': renderDashboard,
  '#itinerary': renderItinerary,
  '#booking': renderBooking, 
  '#admin': renderAdmin
};

function attachStarHandlers(destId) {
    const ratingContainer = document.querySelector(`.card[data-dest-id="${destId}"] .star-rating`);
    if (!ratingContainer) return;

    const stars = ratingContainer.querySelectorAll('.star');

    stars.forEach((star, index) => {
        star.onmouseover = () => {
            stars.forEach((s, i) => {
                s.classList.toggle('active', i <= index);
            });
        };

        star.onmouseout = () => {
            const committedRating = (state.ratings[destId] && state.ratings[destId].slice(-1)[0]) || 0;
            stars.forEach((s, i) => {
                s.classList.toggle('active', i < committedRating);
            });
        };

        star.onclick = () => {
            const rating = index + 1;
            setRating(destId, rating);
        };
    });
}

function setRating(destId, rating) {
  if (!state.ratings[destId]) state.ratings[destId] = [];
  state.ratings[destId] = [rating]; 
  renderDestinations(); 
}

// --- Fix for Post Comment Button ---
function addComment(destId) {
    if(!state.user) { 
        showToast("Please sign in to post a review."); 
        return; 
    }
    
    const input = document.getElementById(`comm-${destId}`);
    if (!input) return;

    const text = input.value.trim();
    if(!text) {
        showToast("Please write something before posting.");
        return;
    }
    
    if(!state.comments[destId]) state.comments[destId] = [];
    
    state.comments[destId].unshift({ 
        user: state.user.name, 
        text: text, 
        date: new Date().toLocaleDateString() 
    });
    
    // --- NOTIFICATION TRIGGER ---
    const dest = state.destinations.find(d => d.id === destId);
    addNotification('system', 'Review Posted', `Your review for <b>${dest.name}</b> is now live!`);
    // -----------------------------
    
    renderDestinations();
    showToast("Comment posted!");
}

function navigateTo(hash) {
    if (location.hash === hash) {
        // We are already on this page, so force a refresh
        route(); 
    } else {
        // Go to the new page
        location.hash = hash; 
    }
}

/* --- FIXED RENDER HELPER (Strict Layout Reset) --- */
function setMain(html){
  const mainEl = document.getElementById('app');
  
  // 1. NUCLEAR RESET: Wipe all inline styles and classes first
  mainEl.removeAttribute('style'); 
  mainEl.className = 'main'; 
  
  // 2. Inject Content
  mainEl.innerHTML = html; 
  
  // 3. Determine Layout based on Page Type
  const hash = location.hash;

  // CASE A: Full Width (Home, Login, Sign Up)
  if(hash === '#home' || hash === '' || hash === '#auth'){
    mainEl.style.padding = '0';
    mainEl.style.maxWidth = '100%';
    mainEl.style.width = '100%';
  } 
  
  // CASE B: Dashboard (Wide Mode) - Checks for Operator, Admin, or User Dash
  else if (html.includes('dashboard-grid-layout')) {
    mainEl.style.maxWidth = '98vw';       
    mainEl.style.width = '98vw';
    mainEl.style.margin = '0 auto';       
    mainEl.style.padding = '30px 20px';   
  } 
  
  // CASE C: Booking Page (Strict Center) - Handles #booking-1, #booking-2, etc.
  else if (hash.startsWith('#booking')) {
    mainEl.classList.add('container'); 
    mainEl.style.maxWidth = '1200px'; /* Force tighter width for booking */
    mainEl.style.width = '100%'; 
    mainEl.style.margin = '0 auto';
    mainEl.style.padding = '30px'; 
  }

  // CASE D: Standard Pages (Destinations, Planner, Packages)
  else {
    mainEl.classList.add('container'); 
    mainEl.style.maxWidth = '1400px'; 
    mainEl.style.width = '100%';
    mainEl.style.margin = '0 auto';
    mainEl.style.padding = '30px'; 
  }
  
  // 4. Scroll to top
  window.scrollTo(0, 0);
}
// --- AUTH UI LOGIC ---

function toggleDropdown() {
    const dropdown = document.getElementById('userDropdownMenu');
    dropdown.classList.toggle('visible');
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userDropdownMenu');
    const avatar = document.getElementById('userProfileArea').querySelector('.user-avatar');
    if (dropdown.classList.contains('visible') && !dropdown.contains(e.target) && (!avatar || !avatar.contains(e.target))) {
        dropdown.classList.remove('visible');
    }
});


/* --- UPDATED AUTH UI WITH NOTIFICATIONS --- */
function updateAuthUI() { 
    const profileArea = document.getElementById('userProfileArea');
    const dropdownMenu = document.getElementById('userDropdownMenu');
    
    if (state.user) {
        const avatarSrc = state.user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        
        // 1. Calculate Unread Count for the Badge
        const unreadCount = state.notifications ? state.notifications.filter(n => !n.read).length : 0;
        const badgeDisplay = unreadCount > 0 ? 'flex' : 'none';
        const badgeText = unreadCount > 9 ? '9+' : unreadCount;

        // 2. Generate HTML: Notification Bell + Currency + Profile
        profileArea.innerHTML = `
            <div class="nav-user-group" style="display:flex; align-items:center;">
                
                <div class="notification-wrapper" style="position:relative; margin-right:15px;">
                    <button class="notif-btn" onclick="event.stopPropagation(); toggleNotifications()">
                        <i class="fa-regular fa-bell"></i>
                        <span class="notif-badge" id="notifBadge" style="display:${badgeDisplay};">${badgeText}</span>
                    </button>

                    <div class="notif-dropdown" id="notifDropdown" onclick="event.stopPropagation()">
                        <div class="notif-header">
                            <h3>Notifications</h3>
                            <button class="text-btn" onclick="markAllNotificationsRead()">Mark all read</button>
                        </div>
                        <div class="notif-list" id="notifList"></div>
                        <div class="notif-footer">
                            <button class="text-btn" onclick="clearAllNotifications()">Clear All</button>
                        </div>
                    </div>
                </div>

                <div class="currency-wrapper">
                    <div class="currency-selector" onclick="event.stopPropagation(); toggleCurrencyDropdown()" title="Change Currency">
                        <span>${state.currency}</span>
                        <i class="fa-solid fa-caret-down" style="font-size:0.7rem; margin-left:2px;"></i>
                    </div>
                    <div id="currencyDropdown" class="currency-menu">
                        ${['PHP', 'USD', 'EUR', 'JPY'].map(c => `
                            <div class="currency-item ${state.currency === c ? 'active' : ''}" onclick="setCurrency('${c}')">
                                ${c}
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="nav-separator"></div>
                
                <img src="${avatarSrc}" class="nav-profile-pic" onclick="event.stopPropagation(); toggleDropdown()" alt="Profile">
            </div>
        `;

        // Populate the user dropdown content
        dropdownMenu.innerHTML = `
            <div class="dropdown-user-info">
                <strong>${state.user.name}</strong>
                <div style="font-size:0.8rem; color:#666;">${state.user.email}</div>
            </div>
            <div style="height:1px; background:#eee; margin:5px 0;"></div>
            <a href="#dashboard" onclick="toggleDropdown()"><i class="fa-solid fa-gauge"></i> Dashboard</a>
            <a href="#itinerary" onclick="toggleDropdown()"><i class="fa-solid fa-calendar-days"></i> Planner</a>
            <a href="#" onclick="event.preventDefault(); openProfileSettings()"><i class="fa-solid fa-gear"></i> Settings</a>
            <div style="height:1px; background:#eee; margin:5px 0;"></div>
            <button onclick="mockSignOut()" style="color:#dc3545; width:100%; text-align:left; padding:10px 15px; background:none; border:none; cursor:pointer;">
                <i class="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
        `;
        
        dropdownMenu.classList.remove('visible'); 

    } else {
        // GUEST VIEW (No Bell)
        profileArea.innerHTML = `
            <button class="btn btn-signup" onclick="openSignUpModal()">Sign Up</button>
            <button class="btn sign-in-button" onclick="openSignInModal()">Log In</button>
        `;
        dropdownMenu.innerHTML = ''; 
        dropdownMenu.classList.remove('visible');
    }
}
function openSignInModal() {
    if (state.user) {
        toggleDropdown();
    } else {
        document.getElementById('signInModal').style.display = 'flex';
    }
}
function closeSignInModal() {
    document.getElementById('signInModal').style.display = 'none';
    document.getElementById('modalSigninEmail').value = '';
    document.getElementById('modalSigninPassword').value = '';
}
function openSignUpModal() {
    document.getElementById('signUpModal').style.display = 'flex';
}
function closeSignUpModal() {
    document.getElementById('signUpModal').style.display = 'none';
}
function closeModalOnOutsideClick(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.style.display = 'none';
    }
}

/* --- FIXED SIGN IN LOGIC --- */
function mockSignIn(asRole, email) { 
    const finalEmail = email || `${asRole}@example.com`;
    const name = capitalize(finalEmail.split('@')[0].replace('.', ' ').split(' ')[0]);
    const role = asRole || 'traveler';
    
    // Mock loyalty points
    const points = role === 'traveler' ? Math.floor(Math.random() * 1500) : 0;

    // 1. Set User State
    state.user = {
        id: Date.now(),
        name,
        role,
        email: finalEmail,
        phone: '0917-XXX-XXXX',
        bio: 'Loves beaches and hiking.',
        loyaltyPoints: points
    };

    // 2. Update Header
    updateAuthUI();
    showToast(`Signed in as ${state.user.name} (${state.user.role})`, 'success');

    // 3. CRITICAL FIX: Refresh the page immediately
    if (location.hash === '#dashboard') {
        // We are already on the Account page, so force a re-render
        route();
    } else {
        // We are somewhere else, go to Dashboard
        navigateTo('#dashboard');
    }
}
/* --- UPDATED SOCIAL LOGIN LOGIC --- */
function mockSocialFromModal(provider = 'Google'){
    // 1. Generate a mock email based on the provider (e.g., user.twitter@example.com)
    const email = `user.${provider.toLowerCase().replace(/\s/g, '')}@example.com`;
    
    // 2. Log them in as a Traveler
    mockSignIn('traveler', email);
    
    // 3. Close the modal
    closeSignInModal();
    
    // 4. Show success message
    setTimeout(() => {
        showToast(`Welcome! Signed in via ${provider}.`, 'success');
    }, 500);
}

/* --- FIXED SIGN UP LOGIC --- */
/* --- FIXED SIGN UP (Stays on Current Page) --- */
function mockSignUpFromModal(form){
    // Use form values if passed, or get by ID
    const nameInput = document.getElementById('modalSignupName');
    const emailInput = document.getElementById('modalSignupEmail');
    const roleInput = document.getElementById('modalSignupRole');

    const name = nameInput ? nameInput.value : 'New User';
    const email = emailInput ? emailInput.value : `user${Date.now()}@example.com`;
    const role = roleInput ? roleInput.value : 'traveler';

    // 1. Set User State
    state.user = {
        id: Date.now(),
        name: capitalize(name),
        role,
        email,
        phone: '',
        bio: '',
        loyaltyPoints: 0
    };

    // 2. Update UI
    updateAuthUI();
    showToast(`Account created: ${state.user.name}`, 'success');
    closeSignUpModal();

    // 3. SMART REDIRECT LOGIC
    if (location.hash === '#auth') {
        navigateTo('#dashboard');
    } else {
        route(); // Stay on current page and refresh
    }
}

/* --- FIX FOR SIGN IN & ADMIN LOGIN --- */

function mockSignInFromModal(form) {
    // 1. Get values from the modal inputs
    const emailInput = document.getElementById('modalSigninEmail');
    const passwordInput = document.getElementById('modalSigninPassword');
    
    const email = emailInput.value.trim();
    
    if (!email) {
        showToast("Please enter an email address.", "error");
        return;
    }

    // 2. SECRET LOGIC: Check if user is trying to be Admin
    // If the email contains the word "admin" (e.g., admin@sofiastravel.com), 
    // we log them in as an Admin. Otherwise, they are a Traveler.
    let role = 'traveler';
    
    if (email.toLowerCase().includes('admin')) {
        role = 'admin';
    } else if (email.toLowerCase().includes('operator')) {
        role = 'operator';
    }

    // 3. Call the main login function
    mockSignIn(role, email);
    
    // 4. Close the modal
    closeSignInModal();
}

// Ensure the main mockSignIn function properly handles redirection
// (Replace your existing mockSignIn if it looks different)
function mockSignIn(asRole, email) { 
    const finalEmail = email || `${asRole}@example.com`;
    const name = capitalize(finalEmail.split('@')[0].replace('.', ' ').split(' ')[0]);
    
    // Mock loyalty points
    const points = asRole === 'traveler' ? Math.floor(Math.random() * 1500) : 0;

    // 1. Set User State
    state.user = {
        id: Date.now(),
        name: name,
        role: asRole,
        email: finalEmail,
        phone: '0917-XXX-XXXX',
        bio: asRole === 'admin' ? 'System Administrator' : 'Loves beaches and hiking.',
        loyaltyPoints: points
    };

    // 2. Update Header
    updateAuthUI();
    showToast(`Signed in as ${state.user.name} (${state.user.role})`, 'success');

    // 3. REDIRECT LOGIC
    if (state.user.role === 'admin') {
        // If Admin, force go to Dashboard
        navigateTo('#dashboard');
        // If already on dashboard, refresh it to show Admin View
        if(location.hash === '#dashboard') renderAdminDashboard();
    } else {
        // If Traveler, stay on page or go to dashboard if on auth page
        if (location.hash === '#auth') {
            navigateTo('#dashboard');
        } else {
            route(); // Refresh current view
        }
    }
}

/* --- FIXED SIGN IN (Stays on Current Page) --- */
function mockSignIn(asRole, email) { 
    const finalEmail = email || `${asRole}@example.com`;
    const name = capitalize(finalEmail.split('@')[0].replace('.', ' ').split(' ')[0]);
    const role = asRole || 'traveler';
    
    // Mock loyalty points
    const points = role === 'traveler' ? Math.floor(Math.random() * 1500) : 0;

    // 1. Set User State
    state.user = {
        id: Date.now(),
        name,
        role,
        email: finalEmail,
        phone: '0917-XXX-XXXX',
        bio: 'Loves beaches and hiking.',
        loyaltyPoints: points
    };

    // 2. Update Header UI (Bell, Avatar, etc.)
    updateAuthUI();
    showToast(`Signed in as ${state.user.name} (${state.user.role})`, 'success');

    // 3. SMART REDIRECT LOGIC
    // If we are on the dedicated Login page (#auth), go to Dashboard.
    // Otherwise (Planner, Home, Booking), STAY HERE and refresh.
    if (location.hash === '#auth') {
        navigateTo('#dashboard');
    } else {
        route(); // Re-render the current page to show logged-in content
    }
} 

function mockSignOut(){
    state.user = null;
    updateAuthUI();
    showToast('You have been signed out.');
    navigateTo('#home');
}

// Set fixed background
/* function setFixedBackground(){
  const candidates = [
    'Boracay.PNG',
    'Puerto Princesa City.PNG',
    'Chocolate Hills.PNG',
    'Vigan.PNG',
    'Tagaytay.PNG',
    'El Nido.PNG',
    ' '
  ];
  let chosen = candidates[candidates.length-1];
  (function tryNext(i){
    if(i>=candidates.length) { document.body.style.backgroundImage = `url(${chosen})`; return; }
    const img = new Image();
    img.onload = function(){ chosen = candidates[i]; document.body.style.backgroundImage = `url('${chosen}')`; };
    img.onerror = function(){ tryNext(i+1); };
    img.src = candidates[i];
  })(0);
  document.body.style.backgroundAttachment = 'fixed';
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
}*/


/* --- PROFESSIONAL OPERATOR DASHBOARD (Currency Aware) --- */

let currentOperatorView = 'overview';

function renderOperatorDashboard() {
    const user = state.user;
    
    // Stats Calculation
    const myPackages = state.packages; 
    // Filter bookings for this operator's packages
    const myBookings = state.bookings.filter(b => myPackages.find(p => p.id === b.packageId));
    
    const totalEarnings = myBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);
    const totalPassengers = myBookings.reduce((sum, b) => sum + b.seats, 0);
    const pendingBookings = myBookings.filter(b => b.status === 'pending').length; 

    let mainContent = '';

    // --- VIEW 1: OVERVIEW ---
    if (currentOperatorView === 'overview') {
        mainContent = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div>
                    <h1 style="margin:0; font-size:2rem; color:var(--primary-dark);">Operator Dashboard</h1>
                    <p class="small muted" style="margin:5px 0 0 0;">Welcome back, ${user.name}. Currency: <strong>${state.currency}</strong></p>
                </div>
                <button class="btn" onclick="openAddPackageModal()">+ New Package</button>
            </div>

            <div class="kpi-row">
                <div class="kpi-box">
                    <div class="small muted">Total Earnings</div>
                    <div style="font-size:1.8rem; font-weight:800; color:#10b981;">${formatPrice(totalEarnings)}</div>
                    <div style="font-size:0.8rem; color:#10b981;">▲ 8% this month</div>
                </div>
                <div class="kpi-box" style="border-left-color:#3b82f6;">
                    <div class="small muted">Total Bookings</div>
                    <div style="font-size:1.8rem; font-weight:800;">${myBookings.length}</div>
                    <div style="font-size:0.8rem; color:#64748b;">Lifetime count</div>
                </div>
                <div class="kpi-box" style="border-left-color:#f59e0b;">
                    <div class="small muted">Active Tours</div>
                    <div style="font-size:1.8rem; font-weight:800;">${myPackages.length}</div>
                    <div style="font-size:0.8rem; color:#64748b;">Live on site</div>
                </div>
                <div class="kpi-box" style="border-left-color:#8b5cf6;">
                    <div class="small muted">Passengers</div>
                    <div style="font-size:1.8rem; font-weight:800;">${totalPassengers}</div>
                    <div style="font-size:0.8rem; color:#64748b;">Happy travelers</div>
                </div>
            </div>

            <div class="content-grid">
                
                <div class="dash-widget span-2">
                    <div class="widget-header">
                        <div class="widget-title">Revenue Trends</div>
                        <select style="border:1px solid #e2e8f0; padding:5px; border-radius:6px; font-size:0.8rem;">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div class="chart-box">
                        <canvas id="operatorRevenueChart"></canvas>
                    </div>
                </div>

                <div class="dash-widget">
                    <div class="widget-header"><div class="widget-title">Top Performer</div></div>
                    <div style="text-align:center; padding:20px 0;">
                        <div style="width:80px; height:80px; background:#e0f2fe; color:#0284c7; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; font-size:2rem;">
                            <i class="fa-solid fa-trophy"></i>
                        </div>
                        <h3 style="margin:0; font-size:1.2rem;">Boracay Escape</h3>
                        <p class="small muted" style="margin:5px 0;">Most booked package</p>
                        <div style="margin-top:15px; font-weight:700; font-size:1.5rem; color:#0f172a;">${formatPrice(12450)}</div>
                        <div class="small" style="color:#10b981;">Generated Revenue</div>
                    </div>
                </div>

                <div class="dash-widget span-3">
                    <div class="widget-header">
                        <div class="widget-title">Recent Bookings</div>
                        <button class="text-btn" onclick="currentOperatorView='bookings'; renderOperatorDashboard()">View All</button>
                    </div>
                    <table class="admin-table">
                        <thead>
                            <tr><th>Ref ID</th><th>Package</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            ${myBookings.length > 0 ? myBookings.slice(0, 5).map(b => `
                                <tr>
                                    <td style="font-family:monospace; font-weight:700;">#${b.id.toString().slice(-6)}</td>
                                    <td>${b.packageTitle}</td>
                                    <td>
                                        <div style="font-weight:600;">${b.traveler}</div>
                                        <div class="small muted">${b.email}</div>
                                    </td>
                                    <td>${b.date}</td>
                                    <td style="font-weight:700;">${formatPrice(parseFloat(b.totalPrice))}</td>
                                    <td><span class="badge ${b.status==='confirmed'?'status-confirmed':'status-cancelled'}">${b.status.toUpperCase()}</span></td>
                                </tr>
                            `).join('') : '<tr><td colspan="6" style="text-align:center; padding:30px; color:#999;">No bookings found.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    } 
    
    // --- VIEW 2: PACKAGES (Grid Layout) ---
    else if (currentOperatorView === 'packages') {
        mainContent = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <h1 style="font-size:2rem; margin:0;">My Tour Packages</h1>
                <button class="btn" onclick="openAddPackageModal()">+ Create New Package</button>
            </div>
            
            <div class="grid cols-3">
                ${state.packages.map(p => `
                    <div class="card" style="padding:0; display:flex; flex-direction:column; height:100%;">
                        <div style="height:200px; position:relative;">
                            <img src="${state.destinations.find(d=>d.id===p.destId)?.image || ''}" style="width:100%; height:100%; object-fit:cover;">
                            <div style="position:absolute; top:10px; right:10px; background:white; padding:5px 10px; border-radius:20px; font-weight:700; font-size:0.8rem; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                                ${formatPrice(p.price)}
                            </div>
                        </div>
                        <div style="padding:20px; flex:1; display:flex; flex-direction:column;">
                            <div class="small muted" style="text-transform:uppercase; letter-spacing:1px; font-weight:700; color:#0ea5e9;">${p.type}</div>
                            <h3 style="margin:5px 0 10px 0; font-size:1.2rem;">${p.title}</h3>
                            <p class="small muted" style="margin:0 0 20px 0; flex:1;">${p.description}</p>
                            
                            <div style="border-top:1px solid #f1f5f9; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
                                <div class="small" style="font-weight:600;"><i class="fa-solid fa-users"></i> ${p.seats} Seats</div>
                                <button class="btn small-btn secondary" style="color:#ef4444; border-color:#fee2e2;" onclick="deletePackage(${p.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- VIEW 3: BOOKINGS (Full Table) ---
    else if (currentOperatorView === 'bookings') {
        mainContent = `
            <h1 style="font-size:2rem; margin:0 0 30px 0;">All Bookings Management</h1>
            <div class="dash-widget" style="min-height:500px;">
                <table class="admin-table">
                    <thead style="background:#f8fafc;">
                        <tr>
                            <th style="padding:15px;">Booking Ref</th>
                            <th>Tour Package</th>
                            <th>Customer Details</th>
                            <th>Travel Date</th>
                            <th>Seats</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${myBookings.map(b => `
                            <tr>
                                <td style="font-family:monospace; font-weight:700; color:#0f4c75;">#${b.id}</td>
                                <td>${b.packageTitle}</td>
                                <td>
                                    <div style="font-weight:600;">${b.traveler}</div>
                                    <div class="small muted">${b.email}</div>
                                </td>
                                <td>${b.date}</td>
                                <td>${b.seats}</td>
                                <td style="font-weight:700;">${formatPrice(parseFloat(b.totalPrice))}</td>
                                <td><span class="badge ${b.status==='confirmed'?'status-confirmed':'status-cancelled'}">${b.status.toUpperCase()}</span></td>
                                <td>
                                    <button class="btn small-btn secondary" onclick="showToast('Voucher sent!')"><i class="fa-solid fa-envelope"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // RENDER LAYOUT
    setMain(`
        <div class="dashboard-grid-layout">
            <aside class="dash-sidebar" style="background:white; height:calc(100vh - 120px);">
                <div style="padding:25px; border-bottom:1px solid #f1f5f9; margin-bottom:20px;">
                    <div style="font-size:0.7rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Operator Panel</div>
                    <div style="font-size:1.2rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:10px;">
                        <div style="width:10px; height:10px; background:#22c55e; border-radius:50%;"></div>
                        ${user.name}
                    </div>
                </div>
                <nav style="display:flex; flex-direction:column; gap:8px;">
                    <button class="dash-menu-btn ${currentOperatorView==='overview'?'active':''}" onclick="currentOperatorView='overview'; renderOperatorDashboard()">
                        <i class="fa-solid fa-chart-line"></i> Overview
                    </button>
                    <button class="dash-menu-btn ${currentOperatorView==='packages'?'active':''}" onclick="currentOperatorView='packages'; renderOperatorDashboard()">
                        <i class="fa-solid fa-box-open"></i> My Packages
                    </button>
                    <button class="dash-menu-btn ${currentOperatorView==='bookings'?'active':''}" onclick="currentOperatorView='bookings'; renderOperatorDashboard()">
                        <i class="fa-solid fa-users"></i> Bookings
                    </button>
                    <div style="height:1px; background:#f1f5f9; margin:15px 0;"></div>
                    <button class="dash-menu-btn" style="color:#ef4444;" onclick="mockSignOut()">
                        <i class="fa-solid fa-right-from-bracket"></i> Logout
                    </button>
                </nav>
            </aside>

            <main style="min-height:85vh;">
                ${mainContent}
            </main>
        </div>
    `);

    if (currentOperatorView === 'overview') {
        setTimeout(initOperatorChart, 100);
    }
}

// Helper: Operator Chart
function initOperatorChart() {
    const ctx = document.getElementById('operatorRevenueChart');
    if(!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Earnings ($)',
                data: [4500, 6200, 5100, 8900, 7500, 12400],
                borderColor: '#10b981', // Green for money
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
        }
    });
}

/* --- MASTER HOMEPAGE RENDERER (With Functional Search Bar) --- */
function renderHome() {
  // 1. Logic: Get Top 3 Destinations based on Rating
  const popularDestinations = state.destinations
    .sort((a,b) => b.rating - a.rating)
    .slice(0, 3); 

  // 2. Logic: Create HTML for Popular Cards
  const popularCardsHtml = popularDestinations.map(d => `
    <div class="card destination" style="cursor:pointer; transition: transform 0.3s ease; border: 1px solid #eee;" 
         onclick="openGallery('${d.id}')">
      
      <div class="dest-thumb" style="height: 250px; position: relative;">
        <img src="${d.image}" alt="${d.name}" style="width:100%; height:100%; object-fit:cover;">
        <div style="position:absolute; top:15px; right:15px; background:white; padding:5px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; color:#f59e0b; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            ★ ${d.rating}
        </div>
        <div style="position:absolute; bottom:15px; left:15px; background:var(--primary); color:white; padding:4px 10px; border-radius:6px; font-size:0.75rem; font-weight:600; text-transform:uppercase;">
            Popular
        </div>
      </div>

      <div style="padding: 25px; display:flex; flex-direction:column; flex:1; background:white;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h3 style="margin:0; font-family:'Playfair Display', serif; font-size:1.4rem; color:#0f172a;">${d.name}</h3>
        </div>
        <p class="muted" style="margin:0 0 20px 0; font-size:0.95rem; line-height:1.5;">${d.summary.substring(0, 80)}...</p>
        <button class="btn secondary" style="width:100%; margin-top:auto;" 
                onclick="event.stopPropagation(); openPackagesByDest('${d.id}')">
            View Packages
        </button>
      </div>
    </div>
  `).join('');

  // 3. RENDER EVERYTHING
  setMain(`
    <section class="hero">
      <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="Boracay">
      <img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963" alt="Cinque Terre">
      <img src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07" alt="Maldives">
      
      <div class="hero-content">
        <h1 style="font-family:'Playfair Display', serif; font-size: 3.5rem; margin-bottom: 15px; text-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            Discover the Philippines
        </h1>
        <p style="font-size: 1.2rem; margin-bottom: 40px; opacity: 0.95;">
            Unforgettable journeys start with a single search.
        </p>
        
        <form class="hero-search-wrapper" onsubmit="event.preventDefault(); handleHomeSearch()">
            <div class="search-field search-container-relative">
                <label class="search-label">Where to?</label>
                <input id="heroDestInput" class="search-input" type="text" placeholder="Boracay, Palawan..." autocomplete="off">
                </div>

            <div class="search-field">
                <label class="search-label">Check In</label>
                <input type="text" class="search-input" onfocus="(this.type='date')" onblur="(this.type='text')" placeholder="Add dates">
            </div>

            <div class="search-field">
                <label class="search-label">Guests</label>
                <input type="number" class="search-input" min="1" value="2" placeholder="Guests">
            </div>

            <button type="submit" class="search-btn-large">
                <i class="fa-solid fa-magnifying-glass"></i>
            </button>
        </form>
      </div>
    </section>

    <section class="section" style="background: #ffffff; padding: 80px 0; position: relative; z-index: 2;">
        <div class="container">
            <div style="text-align:center; margin-bottom:50px;">
                <span style="color:#0f4c75; font-weight:700; text-transform:uppercase; letter-spacing:1px; font-size:0.9rem;">Don't Miss Out</span>
                <h2 style="font-size:2.5rem; color:#0f172a; margin-top:10px;">Popular Destinations</h2>
                <p class="muted" style="max-width:600px; margin:0 auto;">Explore our most sought-after locations, curated just for you based on traveler reviews.</p>
            </div>

            <div class="grid cols-3">
                ${popularCardsHtml}
            </div>

            <div style="text-align:center; margin-top:50px;">
                <button class="btn" onclick="navigateTo('#destinations')">See All Locations</button>
            </div>
        </div>
    </section>

    <section class="section" style="background: #f0f9ff; border-top: 1px solid #e0f2fe; padding: 60px 0;">
        <div class="container">
            <div class="grid cols-3" style="gap:40px;">
                <div class="text-center">
                    <div style="width:70px; height:70px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:1.8rem; color:#0f4c75; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                        <i class="fa-solid fa-shield-halved"></i>
                    </div>
                    <h3 style="margin-bottom:10px; color:#0f172a;">Safe & Secure</h3>
                    <p class="muted">Verified operators and secure payment channels for peace of mind.</p>
                </div>
                <div class="text-center">
                    <div style="width:70px; height:70px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:1.8rem; color:#0f4c75; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                        <i class="fa-solid fa-tag"></i>
                    </div>
                    <h3 style="margin-bottom:10px; color:#0f172a;">Best Price Guarantee</h3>
                    <p class="muted">We match prices to ensure you get the best deal for your adventure.</p>
                </div>
                <div class="text-center">
                    <div style="width:70px; height:70px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:1.8rem; color:#0f4c75; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                        <i class="fa-solid fa-headset"></i>
                    </div>
                    <h3 style="margin-bottom:10px; color:#0f172a;">24/7 Support</h3>
                    <p class="muted">Our local experts are always available to help you during your trip.</p>
                </div>
            </div>
        </div>
    </section>

    <section style="background: linear-gradient(135deg, #0f4c75 0%, #000 100%); padding: 80px 0; color: white; text-align: center;">
      <div class="container" style="max-width: 800px;">
        <h2 style="color: white; margin-bottom: 10px;">Don't Miss the Next Adventure</h2>
        <p style="font-size: 1.2rem; opacity: 0.8; margin-bottom: 30px;">Join 50,000+ subscribers getting exclusive deals.</p>
        
        <form onsubmit="handleSubscribe(event)" style="display: flex; gap: 10px; justify-content: center;">
          <input type="email" placeholder="Enter your email address" required 
                 style="padding: 15px; border-radius: 8px; border: none; width: 60%; font-size:1rem; outline:none;">
          <button type="submit" class="btn" style="background: #fcd34d; color: black; font-weight:800; padding: 15px 30px; border:none; cursor:pointer;">
            Subscribe
          </button>
        </form>
        
        <p style="font-size: 0.8rem; margin-top: 20px; opacity: 0.6;">No spam, unsubscribe anytime.</p>
      </div>
    </section>
  `);

  // --- CRITICAL FIX: ACTIVATE AUTOCOMPLETE ---
  // Wait 100ms for the HTML to be injected, then attach the listener
  setTimeout(() => {
      setupSearchAutocomplete('heroDestInput');
  }, 100);
}

/* --- PROFESSIONAL DESTINATIONS (With Search) --- */
function renderDestinations(filterType = 'all') {
  
  let displayList = state.destinations;
  
  // Filter Logic (Category)
  if (filterType !== 'all') {
      const matchingPackages = state.packages.filter(p => {
          if (filterType === 'culture') return p.type === 'culture' || p.type === 'cultural';
          return p.type === filterType;
      });
      const allowedDestIds = matchingPackages.map(p => p.destId);
      displayList = state.destinations.filter(d => allowedDestIds.includes(d.id));
  }

  const listHtml = displayList.map(d => {
    const isWishlisted = state.wishlist.includes(d.id);
    const destPackages = state.packages.filter(p => p.destId === d.id);
    const minPrice = destPackages.length > 0 ? Math.min(...destPackages.map(p => p.price)) : null;

    // Added 'data-search-term' for easy filtering
    return `
    <div class="card destination" data-dest-id="${d.id}" data-search-term="${d.name.toLowerCase()} ${d.province.toLowerCase()}">
      
      <div class="dest-thumb" onclick="openGallery('${d.id}')">
        <img src="${d.image}" alt="${d.name}">
        <div class="wishlist-heart ${isWishlisted ? 'active' : ''}" 
            onclick="event.stopPropagation(); handleDestinationWishlist(this, '${d.id}')" title="Save to Wishlist">
            <i class="fa-solid fa-heart"></i>
        </div>
        <button class="view-map-btn" onclick="event.stopPropagation(); openSpecificMap('${d.id}')">
            <i class="fa-solid fa-map-location-dot"></i> View Map
        </button>
      </div>

      <div class="dest-card-content">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 5px;">
            <h3 style="margin: 0; color: var(--text-dark); font-family: 'Playfair Display', serif; font-size: 1.4rem;">${d.name}</h3>
            <div class="rating-badge" onclick="event.stopPropagation(); openReviewModal('${d.id}')" 
                 style="background:#fffbeb; color:#b45309; padding:4px 8px; border-radius:6px; font-weight:700; font-size:0.8rem; display:flex; align-items:center; gap:4px; cursor:pointer;">
                <i class="fa-solid fa-star" style="color:#f59e0b;"></i> ${d.rating}
            </div>
        </div>
        
        <div class="dest-location">
            <i class="fa-solid fa-location-dot" style="color:var(--accent);"></i>
            ${d.province}, Philippines
        </div>
        
        <p style="margin: 0 0 20px 0; color: var(--text-med); line-height: 1.6; font-size: 0.95rem;">
            ${d.summary.length > 90 ? d.summary.substring(0, 90) + '...' : d.summary}
        </p>

        <div class="dest-footer">
            <div>
                ${minPrice ? `
                    <span class="start-price-label">Packages from</span>
                    <span class="start-price-value">${formatPrice(minPrice)}</span>
                ` : `
                    <span class="start-price-label">Status</span>
                    <span class="start-price-value" style="font-size:1rem; color:#64748b;">Sold Out</span>
                `}
            </div>
            <button class="btn secondary" onclick="openPackagesByDest('${d.id}')">
                View Deals <i class="fa-solid fa-arrow-right" style="font-size:0.8rem; margin-left:5px;"></i>
            </button>
        </div>
      </div>
    </div>
  `}).join('');
  
  setMain(`
    <section>
      <div class="destinations-header">
        <h2 style="margin:0; font-size:3rem; color:var(--text-dark);">Explore Paradise</h2>
        <p class="muted" style="font-size:1.1rem; margin-top:10px;">Discover the breathtaking islands and heritage of the Philippines.</p>
        
        <div class="page-search-container">
            <i class="fa-solid fa-magnifying-glass page-search-icon"></i>
            <input type="text" class="page-search-input" placeholder="Search places..." oninput="filterPageItems(this.value, '.card.destination')">
        </div>

        <div class="filter-bar">
            <button class="filter-btn ${filterType==='all'?'active':''}" onclick="renderDestinations('all')">All Locations</button>
            <button class="filter-btn ${filterType==='leisure'?'active':''}" onclick="renderDestinations('leisure')"><i class="fa-solid fa-umbrella-beach"></i> Leisure</button>
            <button class="filter-btn ${filterType==='adventure'?'active':''}" onclick="renderDestinations('adventure')"><i class="fa-solid fa-person-hiking"></i> Adventure</button>
            <button class="filter-btn ${filterType==='culture'?'active':''}" onclick="renderDestinations('culture')"><i class="fa-solid fa-landmark"></i> Culture</button>
        </div>
      </div>

      <div class="grid cols-3" style="align-items: stretch;">
        ${displayList.length > 0 ? listHtml : `<div style="grid-column: 1/-1; text-align:center; padding: 60px; color:#64748b; font-size:1.2rem;">No destinations found.</div>`}
      </div>
    </section>
  `);
}

function filterDestinations(){ 
    const selectedType = document.getElementById('filterType').value;
    // Call render with the selected type to refresh the view
    renderDestinations(selectedType);
}
function openPackagesByDest(destId){ location.hash = '#packages'; setTimeout(()=>renderPackages(destId),50) }

// Wishlist Logic
function toggleWishlist(pkgId) {
    if (!state.user) {
        openSignInModal();
        return;
    }

    const index = state.wishlist.indexOf(pkgId);
    
    if (index === -1) {
        // ADDING to Wishlist
        state.wishlist.push(pkgId);
        showToast('Saved to Wishlist!');
        
        // --- NOTIFICATION TRIGGER ---
        const pkg = state.packages.find(p => p.id === pkgId);
        const name = pkg ? pkg.title : 'Destination';
        addNotification('system', 'Saved to Wishlist', `You saved <b>${name}</b> for later.`);
        // -----------------------------
        
    } else {
        // REMOVING from Wishlist
        state.wishlist.splice(index, 1);
        showToast('Removed from Wishlist.');
    }

    // Refresh views if necessary
    if (location.hash === '#dashboard' && currentDashboardTab === 'wishlist') {
        renderTravelerDashboard();
    } else if (location.hash === '#packages' || location.hash === '#destinations') {
         // Re-render to update heart icons
         if(location.hash === '#packages') renderPackages(null);
         if(location.hash === '#destinations') renderDestinations();
    }
}

/* --- PROFESSIONAL PACKAGES (With Search) --- */
function renderPackages(preselectDest) {
  const packages = state.packages.filter(p => !preselectDest || p.destId === preselectDest);
  
  const rows = packages.map(p => {
    const isWishlisted = state.wishlist.includes(p.id);
    const dest = state.destinations.find(d => d.id === p.destId);
    const duration = p.type === 'adventure' ? '3 Days' : p.type === 'culture' ? '1 Day' : '2 Days';
    
    // Added 'data-search-term' to package card
    return `
    <div class="pkg-card" data-search-term="${p.title.toLowerCase()} ${dest.name.toLowerCase()}">
      <div class="pkg-thumb">
        <img src="${dest.image}" alt="${p.title}">
        <span class="pkg-category-badge">${p.type}</span>
        <button class="pkg-wishlist-btn ${isWishlisted ? 'active' : ''}" 
                onclick="event.stopPropagation(); toggleWishlist(${p.id});" 
                title="Save to Wishlist">
            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>

      <div class="pkg-content">
        <div class="small muted" style="margin-bottom:5px; text-transform:uppercase; font-size:0.75rem; letter-spacing:1px;">
            ${dest.name}, PH
        </div>
        <h3 class="pkg-title">${p.title}</h3>
        <div class="pkg-meta-row">
            <div class="pkg-meta-item"><i class="fa-regular fa-clock"></i> ${duration}</div>
            <div class="pkg-meta-item"><i class="fa-solid fa-user-group"></i> ${p.seats} Seats Left</div>
        </div>
        <p class="pkg-desc">${p.description}</p>

        <div class="pkg-footer">
            <div class="pkg-price-group">
                <span class="pkg-price-label">Per Person</span>
                <span class="pkg-price-val">${formatPrice(p.price)}</span>
            </div>
            <button class="pkg-book-btn" onclick="navigateTo('#booking-${p.id}')">Book Now</button>
        </div>
      </div>
    </div>
  `}).join('');
  
  setMain(`
    <section>
      <div class="packages-header-row">
        <div>
            <h2 style="margin:0; font-size:2.5rem; color:#1e293b;">Curated Tour Packages</h2>
            <p class="muted" style="margin:5px 0 0 0;">Prices shown in <strong>${state.currency}</strong></p>
        </div>
        
        <div style="display:flex; align-items:center; gap:15px;">
            <div class="page-search-container" style="margin:0; width:250px;">
                <i class="fa-solid fa-magnifying-glass page-search-icon"></i>
                <input type="text" class="page-search-input" placeholder="Search tours..." oninput="filterPageItems(this.value, '.pkg-card')">
            </div>

            <label class="small" style="font-weight:600; white-space:nowrap;">Sort by:</label>
            <select class="sort-dropdown">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
            </select>
        </div>
      </div>
      
      <div class="grid cols-3" style="gap:30px;">${rows}</div>
      ${preselectDest ? `<div class="view-all-btn-container"><h3 style="margin:0 0 10px 0; font-size:1.1rem; color:#1e293b;">Looking for something else?</h3><button class="btn btn-pulse" onclick="renderPackages(null)">View All Packages</button></div>` : ''}
    </section>
  `);
}


let pendingPackageId = null;
let pendingBooking = null;

function openPaymentModal(packageId) {
    // 1. Validate Inputs from the Booking Page
    const name = document.getElementById('travelerName').value;
    const email = document.getElementById('travelerEmail').value;
    const date = document.getElementById('travelDate').value;
    const seats = parseInt(document.getElementById('seats').value, 10);

    if (!name || !email || !date || !seats) {
        showToast("Please fill in all traveler details first.", "error");
        return;
    }

    // 2. Save Pending Data
    pendingPkg = state.packages.find(p => p.id === packageId);
    pendingDetails = { name, email, date, seats };
    
    // 3. Render The Professional Modal
    const dest = state.destinations.find(d => d.id === pendingPkg.destId);
    const total = (pendingPkg.price * seats).toFixed(2);
    
    // We construct the HTML dynamically to reset state every time
    const modalContent = document.getElementById('paymentModalOverlay').querySelector('.modal-content');
    
    // Set the HTML Structure
    modalContent.innerHTML = `
        <button class="modal-close-btn" onclick="closePaymentModal()" style="z-index:10;">×</button>
        
        <div class="checkout-left">
            <h2 style="margin-top:0; color:#1e293b;">Secure Checkout</h2>
            <p class="small muted" style="margin-bottom:20px;">Complete your purchase securely. SSL Encrypted.</p>
            
            <label style="font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:10px; display:block;">Select Payment Method</label>
            <div class="pay-methods">
                <div id="pm-card" class="pay-method-card active" onclick="selectPaymentMethod('card')">
                    <i class="fa-regular fa-credit-card" style="font-size:1.5rem; color:#475569; margin-bottom:5px;"></i>
                    <div style="font-size:0.8rem;">Credit Card</div>
                </div>
                <div id="pm-gcash" class="pay-method-card" onclick="selectPaymentMethod('gcash')">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/GCash_logo.svg/1280px-GCash_logo.svg.png" alt="GCash">
                    <div style="font-size:0.8rem;">GCash</div>
                </div>
                <div id="pm-maya" class="pay-method-card" onclick="selectPaymentMethod('maya')">
                    <img src="https://cdn.manilastandard.net/wp-content/uploads/2022/05/maya.jpg" alt="Maya">
                    <div style="font-size:0.8rem;">Maya</div>
                </div>
            </div>

            <form id="proPaymentForm" onsubmit="event.preventDefault(); processProPayment()">
                <div id="paymentFormInputs">
                    <div class="checkout-input-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" oninput="formatCardInput(this)" maxlength="19" required>
                    </div>
                    <div class="checkout-input-group">
                        <label>Cardholder Name</label>
                        <input type="text" placeholder="Name as on card" style="font-family:inherit;" required>
                    </div>
                    <div class="row">
                        <div class="checkout-input-group" style="flex:1">
                            <label>Expiry Date</label>
                            <input type="text" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="checkout-input-group" style="flex:1">
                            <label>CVV / CVC</label>
                            <input type="password" placeholder="123" maxlength="3" required>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top:auto;">
                    <button type="submit" class="btn" style="width:100%; padding:15px; font-size:1.1rem; display:flex; justify-content:space-between; align-items:center;">
                        <span>Pay Securely</span>
                        <span id="payBtnAmount">$${total}</span>
                    </button>
                    <div style="text-align:center; margin-top:10px; font-size:0.75rem; color:#94a3b8;">
                        <i class="fa-solid fa-lock"></i> 256-bit SSL Encryption
                    </div>
                </div>
            </form>
        </div>

        <div class="checkout-right">
            <h3 style="margin-top:0;">Order Summary</h3>
            <img src="${dest.image}" class="summary-img">
            
            <div style="flex:1;">
                <h4 style="margin:0 0 5px 0;">${pendingPkg.title}</h4>
                <p class="small muted" style="margin:0 0 15px 0;">${dest.name}, ${dest.province}</p>
                
                <div class="summary-row">
                    <span>Date</span>
                    <strong>${date}</strong>
                </div>
                <div class="summary-row">
                    <span>Travelers</span>
                    <strong>${seats} Adult(s)</strong>
                </div>
                <div class="summary-row">
                    <span>Price per person</span>
                    <span>$${pendingPkg.price}</span>
                </div>
                 <div class="summary-row">
                    <span>Tax & Fees</span>
                    <span>$0.00</span>
                </div>
            </div>

            <div class="summary-total">
                <span style="font-size:1.1rem; color:#334155;">Total Due</span>
                <span class="total-price">$${total}</span>
            </div>
        </div>
    `;

    document.getElementById('paymentModalOverlay').style.display = 'flex';
}

/* --- PROCESSING & SUCCESS LOGIC --- */
function processProPayment() {
    // 1. Show Loading State
    const btn = document.querySelector('#proPaymentForm button');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...`;
    
    // Simulate Network Request (2.5 seconds)
    setTimeout(() => {
        // 2. Perform Finalization Logic
        finalizeBookingLogic(pendingPkg, pendingDetails);
        
        // 3. Show Success View inside the Modal
        const modalContent = document.getElementById('paymentModalOverlay').querySelector('.modal-content');
        
        // Use a nice Ticket Layout
        modalContent.innerHTML = `
             <div style="width:100%; padding:40px; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f0f9ff; text-align:center;">
                
                <div class="success-ticket">
                    <div style="background:var(--success); padding:20px; color:white;">
                        <i class="fa-regular fa-circle-check" style="font-size:3rem;"></i>
                        <h2 style="margin:10px 0 0 0; color:white;">Payment Successful!</h2>
                        <p style="margin:5px 0 0 0; opacity:0.9;">Ref: #${Date.now().toString().slice(-8)}</p>
                    </div>
                    <div style="padding:25px;">
                        <h3 style="margin:0 0 5px 0; color:#333;">${pendingPkg.title}</h3>
                        <p class="small muted">${pendingDetails.date} • ${pendingDetails.seats} Travelers</p>
                        
                        <div style="border-top:1px dashed #eee; margin:20px 0; padding-top:20px; display:flex; justify-content:space-between;">
                            <span class="muted">Total Paid</span>
                            <span style="font-weight:800; color:#333;">$${(pendingPkg.price * pendingDetails.seats).toFixed(2)}</span>
                        </div>
                        
                        <p class="small muted" style="text-align:center;">A confirmation email has been sent to <strong>${pendingDetails.email}</strong>.</p>
                    </div>
                </div>

                <button class="btn" style="margin-top:30px; width:200px;" onclick="closePaymentModal(); navigateTo('#dashboard');">View My Booking</button>
             </div>
        `;
        
    }, 2500);
}

// Factor out logic from old finalizeBooking to keep things clean
function finalizeBookingLogic(pkg, details) {
     if(!state.user){ 
         // Auto-create guest account if needed
         state.user = {id:Date.now(),name:details.name,role:'traveler',email:details.email, loyaltyPoints: 0}; 
         updateAuthUI(); 
     }

    const priceTotal = (pkg.price * details.seats);
    const pointsEarned = Math.floor(priceTotal / 10);
    state.user.loyaltyPoints += pointsEarned;

    const booking = {
        id: 'BK' + Math.floor(Math.random()*900000+10000),
        packageId: pkg.id,
        packageTitle: pkg.title,
        traveler: state.user.name,
        email: state.user.email,
        date: details.date,
        seats: details.seats,
        paid: true,
        totalPrice: priceTotal.toFixed(2), 
        paymentMethod: currentPaymentMethod === 'card' ? 'Credit Card' : 'E-Wallet',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    state.bookings.push(booking);
    
    // Trigger System Notification
    if (typeof addNotification === 'function') {
        addNotification('booking', 'Booking Confirmed!', `You are going to ${pkg.title}!`);
    }
}

function closePaymentModal(){ 
  document.getElementById('paymentModalOverlay').style.display = 'none'; 
  pendingPackageId = null; 
  pendingBooking = null;
}

function buildPaymentFields(method){
  const container = document.getElementById('paymentDetails');
  container.innerHTML = '';

  if(method === 'Credit/Debit Card'){
    container.innerHTML = `
      <label>Cardholder Name</label>
      <input placeholder="Name on Card" required />
      <label>Card Number</label>
      <input placeholder="XXXX XXXX XXXX XXXX" maxlength="16" pattern="[0-9]{16}" title="16 digits" required />
      <div class="row">
        <div style="flex:1">
          <label>Expiry (MM/YY)</label>
          <input placeholder="MM/YY" maxlength="5" pattern="(0[1-9]|1[0-2])\\/([0-9]{2})" title="MM/YY format" required />
        </div>
        <div style="width:100px">
          <label>CVV</label>
          <input placeholder="XXX" maxlength="4" pattern="[0-9]{3,4}" title="3 or 4 digits" required />
        </div>
      </div>
    `;
  } else if (method === 'GCash' || method === 'PayMaya'){
     container.innerHTML = `
      <label>Mobile Number</label>
      <input placeholder="09XX-XXXXXXX" pattern="09[0-9]{9}" title="e.g. 0917-xxxxxxx" required />
      <p class="small muted" style="padding:0; margin-top: -5px; margin-bottom: 5px;">A request will be sent to this number for payment confirmation.</p>
    `;
  }
}

function handlePaymentConfirm(){
  const form = document.getElementById('paymentForm');
  const method = form.paymentMethod.value;
  
  if(!method){ 
    showToast('Please select a payment method.'); 
    return; 
  }
  
  const inputs = form.querySelectorAll('#paymentDetails input[required]');
  let isValid = true;
  inputs.forEach(input => {
    if (!input.value || !input.checkValidity()) {
      isValid = false;
    }
  });
  if (!isValid) {
    showToast('Please fill out all payment details correctly.');
    return;
  }

  let details = {};
  if (method === 'Credit/Debit Card') {
      details.cardNumber = 'XXXX-XXXX-XXXX-' + form.querySelector('input[placeholder="XXXX XXXX XXXX XXXX"]')?.value.slice(-4);
  } else if (method === 'GCash' || method === 'PayMaya') {
      details.mobile = form.querySelector('input[placeholder="09XX-XXXXXXX"]')?.value;
  }

  finalizeBooking(pendingPackageId, method, details);
}

function finalizeBooking(packageId, method, details){
  const pkg = state.packages.find(p=>p.id===packageId);
  
  const name = document.getElementById('travelerName')?.value || (state.user && state.user.name) || (pendingBooking && pendingBooking.name) || 'Guest';
  const email = document.getElementById('travelerEmail')?.value || (state.user && state.user.email) || (pendingBooking && pendingBooking.email) || 'guest@example.com';
  const date = document.getElementById('travelDate')?.value || (pendingBooking && pendingBooking.date) || '';
  const seats = parseInt(document.getElementById('seats')?.value || (pendingBooking && pendingBooking.seats) || '1',10);
  const priceTotal = (pkg.price * seats);

  if(!state.user){ state.user = {id:Date.now(),name:name,role:'traveler',email, loyaltyPoints: 0}; updateAuthUI(); }

  // Add Loyalty Points (1 point per $10 spent)
  const pointsEarned = Math.floor(priceTotal / 10);
  state.user.loyaltyPoints += pointsEarned;

    addNotification('booking', 'Booking Confirmed!', `Pack your bags! Your trip to <b>${pkg.title}</b> is confirmed.`);

  const booking = {
    id: 'BK' + Math.floor(Math.random()*900000+10000),
    packageId: pkg.id,
    packageTitle: pkg.title,
    traveler: state.user.name,
    email: state.user.email,
    date: date,
    seats: seats,
    paid: true,
    totalPrice: priceTotal.toFixed(2), 
    paymentMethod: method,
    paymentDetails: details,
    ticketUrl: '#',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  state.bookings.push(booking);

  document.getElementById('paymentCompleteText').innerHTML = `
    <div style="font-size:1.1rem; color:#333; margin-bottom:10px;">Booking **${booking.id}** Confirmed!</div>
    <div class="small muted">You earned <strong>${pointsEarned} Loyalty Points</strong> for this trip!</div>
    <div class="small muted" style="margin-top:5px;">Confirmation email sent to ${booking.email}.</div>
  `;
  document.getElementById('paymentCompleteOverlay').style.display = 'flex';
  closePaymentModal();

  setTimeout(()=>{
    document.getElementById('paymentCompleteOverlay').style.display = 'none';
    currentDashboardTab = 'history'; // Switch tab to history
    navigateTo('#dashboard'); 
  }, 3500); 
}


/* --- PROFESSIONAL BOOKING PAGE (Fixed & Complete) --- */
function renderBooking(packageId){ 
  const pkg = state.packages.find(p => p.id === packageId);
  if(!pkg) { navigateTo('#packages'); return; }

  const today = new Date().toISOString().split('T')[0];
  const dest = state.destinations.find(d => d.id === pkg.destId);

  // Initial Price Render (Currency Aware)
  const displayPrice = formatPrice(pkg.price);

  setMain(`
    <section class="card" style="padding: 40px; max-width: 1200px; margin: 0 auto; border:none; box-shadow:none;">
      
      <div style="border-bottom:1px solid #eef2f7; padding-bottom:20px; margin-bottom:30px;">
         <a href="#packages" style="text-decoration:none; color:#64748b; font-size:0.9rem; display:flex; align-items:center; gap:5px; margin-bottom:10px;">
            <i class="fa-solid fa-arrow-left"></i> Back to Packages
         </a>
         <h2 style="margin:0; font-size:2rem; color:var(--accent);">Secure Booking</h2>
         <p class="small muted" style="margin-top:5px;">You are booking: <strong>${pkg.title}</strong></p>
      </div>

      <div class="booking-layout">

        <form onsubmit="event.preventDefault(); openPaymentModal(${pkg.id})">

            <div class="booking-section-title">
                <span class="booking-step-badge">1</span>
                Guest Information
            </div>
            <div class="row">
                <div style="flex:1">
                    <label>Lead Traveler Name</label>
                    <input id="travelerName" placeholder="Name as per Valid ID" value="${state.user?.name || ''}" required />
                </div>
                <div style="flex:1">
                    <label>Nationality</label>
                    <select id="nationality" style="width:100%;">
                        <option>Filipino</option>
                        <option>American</option>
                        <option>South Korean</option>
                        <option>Japanese</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <div class="row">
                <div style="flex:1">
                    <label>Email Address</label>
                    <input id="travelerEmail" type="email" placeholder="For booking confirmation" value="${state.user?.email || ''}" required />
                </div>
                <div style="flex:1">
                    <label>Mobile Number</label>
                    <input id="travelerPhone" type="tel" value="${state.user?.phone || ''}" placeholder="+63 900 000 0000" required />
                </div>
            </div>

            <div class="booking-section-title">
                <span class="booking-step-badge">2</span>
                Trip Details
            </div>
            <div class="row">
                <div style="flex:1">
                    <label>Travel Date</label>
                    <input id="travelDate" type="date" min="${today}" required />
                </div>
                <div style="flex:1">
                    <label>Number of Guests</label>
                    <input id="seats" type="number" value="1" min="1" max="${pkg.seats}" required oninput="updateBookingTotal(${pkg.price})" />
                </div>
            </div>
            <div style="margin-bottom:15px;">
                <label>Pickup Location</label>
                <input id="pickupLoc" placeholder="Enter Hotel Name or Airport Flight Number" />
                <p class="small muted" style="margin-top:5px;">We will coordinate pickup time 24 hours before your trip.</p>
            </div>

            <div class="booking-section-title">
                <span class="booking-step-badge">3</span>
                Special Requests
            </div>
            <div class="row">
                <div style="flex:1">
                    <label>Dietary Requirements</label>
                    <select id="dietary" style="width:100%;">
                        <option value="none">None</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="halal">Halal</option>
                        <option value="gluten-free">Gluten Free</option>
                        <option value="allergies">Food Allergies (Specify in notes)</option>
                    </select>
                </div>
            </div>
            <div style="margin-top:10px;">
                <label>Additional Notes</label>
                <textarea id="specialRequests" rows="3" placeholder="Celebrating a birthday? Need accessibility assistance? Let us know!"></textarea>
            </div>

            <div style="margin-top:30px; background:#fffbeb; border:1px solid #fcd34d; padding:15px; border-radius:8px; display:flex; gap:12px; align-items:flex-start;">
                <input type="checkbox" required style="width:20px; height:20px; margin-top:3px; flex-shrink:0;">
                <span class="small" style="color:#78350f; line-height:1.5;">
                    I accept the <strong>Terms & Conditions</strong>. I understand that pickup times are subject to change.
                </span>
            </div>

            <div style="margin-top:40px; display:flex; justify-content:flex-end;">
                <button class="btn" type="submit" style="padding:15px 40px; font-size:1.1rem; box-shadow: 0 4px 15px rgba(15, 76, 117, 0.3);">
                    Proceed to Payment <i class="fa-solid fa-chevron-right" style="margin-left:10px;"></i>
                </button>
            </div>
        </form>

        <div class="price-summary-card">
            <h3 style="margin-top:0; color:#1e293b;">Booking Summary</h3>
            
            <div style="display:flex; gap:15px; margin-bottom:20px;">
                <img src="${dest.image}" style="width:80px; height:80px; border-radius:8px; object-fit:cover;">
                <div>
                    <h4 style="margin:0 0 5px 0; font-size:1rem;">${pkg.title}</h4>
                    <p class="small muted" style="margin:0;">${dest.name}, ${dest.province}</p>
                    <div style="margin-top:5px; font-size:0.8rem; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; display:inline-block;">${pkg.type.toUpperCase()} Tour</div>
                </div>
            </div>

            <div style="border-top:1px dashed #cbd5e1; padding-top:15px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.95rem; color:#475569;">
                    <span>Base Price</span>
                    <span>${displayPrice}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.95rem; color:#475569;">
                    <span>Guests</span>
                    <span id="summaryGuestCount">x 1</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.95rem; color:#475569;">
                    <span>Taxes & Fees</span>
                    <span>Included</span>
                </div>
                
                <div style="display:flex; justify-content:space-between; margin-top:15px; padding-top:15px; border-top:2px solid #e2e8f0; align-items:center;">
                    <span style="font-weight:700; color:#1e293b;">Total Estimate</span>
                    <span id="summaryTotal" style="font-weight:800; font-size:1.5rem; color:var(--accent);">${displayPrice}</span>
                </div>
            </div>

            <div style="margin-top:20px; background:#dcfce7; padding:12px; border-radius:8px; font-size:0.85rem; color:#166534; display:flex; gap:10px;">
                <i class="fa-solid fa-shield-halved" style="margin-top:3px;"></i>
                <div>
                    <strong>Secure Booking</strong><br>Your payment information is encrypted and safe.
                </div>
            </div>
        </div>

      </div>
    </section>
  `);
}

// Helper: Live Update Price (With Currency Support)
window.updateBookingTotal = function(basePriceInPhp) {
    const seatsInput = document.getElementById('seats');
    // Ensure seats is at least 1
    let seats = parseInt(seatsInput.value) || 1;
    if(seats < 1) seats = 1;

    // Calculate total in PHP
    const totalPhp = basePriceInPhp * seats;
    
    // Update UI using the formatPrice helper (handles Currency conversion)
    document.getElementById('summaryGuestCount').innerText = `x ${seats}`;
    document.getElementById('summaryTotal').innerText = formatPrice(totalPhp);
}

// Helper: Live Update Price (Now Currency Aware)
window.updateBookingTotal = function(basePriceInPhp) {
    const seats = document.getElementById('seats').value;
    const totalPhp = basePriceInPhp * seats;
    
    document.getElementById('summaryGuestCount').innerText = `x ${seats}`;
    document.getElementById('summaryTotal').innerText = formatPrice(totalPhp);
}

function renderItinerary() {
  // Sort itineraries by date
  const sortedItineraries = state.itineraries.sort((a, b) => new Date(a.date) - new Date(b.date));

  setMain(`
    <section>
      <div style="margin-bottom: 30px;">
        <h1 style="font-size: 2.2rem; margin-bottom: 10px; color: var(--accent);">Trip Planner</h1>
        <p class="small muted" style="padding:0;">Organize your schedule, add notes, and export your perfect itinerary.</p>
      </div>

      <div class="planner-layout">
        
        <div class="planner-sidebar">
            <div class="planner-header">
                <h3 style="margin:0; font-size: 1.2rem;">Add New Activity</h3>
                <p class="small muted" style="padding:0; font-size:0.85rem;">Fill in details to update your timeline.</p>
            </div>
            
            <form onsubmit="event.preventDefault(); addItinerary()">
                <label style="font-size:0.85rem; font-weight:600;">Activity Title</label>
                <input id="itTitle" placeholder="e.g. Island Hopping Tour" style="margin-bottom: 12px;" required />
                
                <label style="font-size:0.85rem; font-weight:600;">Date</label>
                <input id="itDate" type="date" style="margin-bottom: 12px;" required />
                
                <label style="font-size:0.85rem; font-weight:600;">Details & Notes</label>
                <textarea id="itDesc" rows="4" placeholder="Time, location, booking ref..." style="margin-bottom: 15px;"></textarea>
                
                <button class="btn" type="submit" style="width: 100%;">+ Add to Timeline</button>
            </form>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f3f5;">
                <button class="btn secondary" onclick="exportItineraries()" style="width: 100%; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                    Export Itinerary
                </button>
            </div>
        </div>

        <div>
            <div class="timeline-feed">
                
                <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <span class="timeline-date-badge">Sample: Upcoming</span>
                        <h3 style="margin: 0 0 5px 0; color: #343a40;">Arrival in Boracay</h3>
                        <p class="small muted" style="padding:0; margin-bottom: 10px;">12:00 PM • Caticlan Airport</p>
                        <p style="font-size: 0.95rem; color: #495057; line-height: 1.5;">
                            Van transfer to the port, then boat to the island. Check-in at the resort and head straight to White Beach for the sunset.
                        </p>
                    </div>
                </div>

                ${sortedItineraries.length > 0 ? sortedItineraries.map(it => `
                    <div class="timeline-item">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <span class="timeline-date-badge">${new Date(it.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <h3 style="margin: 0 0 8px 0; color: #343a40;">${it.title}</h3>
                            <p style="font-size: 0.95rem; color: #495057; white-space: pre-wrap; line-height: 1.6;">${it.description || 'No additional details.'}</p>
                            
                            <div style="margin-top:15px; display:flex; gap:10px;">
                                <button class="btn small-btn secondary" style="padding: 4px 10px; font-size:0.75rem;" onclick="showToast('Edit feature coming soon')">Edit</button>
                                <button class="btn small-btn secondary" style="padding: 4px 10px; font-size:0.75rem; color:#dc3545; border-color:#fadbd8;" onclick="deleteItinerary('${it.title}')">Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('') : ''}

            </div>

            ${sortedItineraries.length === 0 ? `
                <div class="empty-state">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📅</div>
                    <h3 style="margin:0; color:#343a40;">Your timeline is empty</h3>
                    <p>Use the form on the left to start planning your trip.</p>
                </div>
            ` : ''}
        </div>

      </div>
    </section>
  `);
}

// Add this helper to delete items if you don't have one yet
function deleteItinerary(title) {
    if(confirm('Remove this activity?')) {
        state.itineraries = state.itineraries.filter(i => i.title !== title);
        renderItinerary();
    }
}

function addItinerary(){ 
  const title=document.getElementById('itTitle').value; 
  const date=document.getElementById('itDate').value; 
  const desc=document.getElementById('itDesc').value; 
  if(!title || !date) { showToast('Title and Date are required.'); return; }
  state.itineraries.push({title,date,description:desc}); 
  renderItinerary(); 
} 

function exportItineraries(){ 
  const data=state.itineraries.map(i=>`--- ${i.title} (${i.date}) ---\n${i.description}`).join('\n\n'); 
  const blob=new Blob([data||'No itineraries'],{type:'text/plain'}); 
  const url=URL.createObjectURL(blob); 
  const a=document.createElement('a'); 
  a.href=url; 
  a.download='sofias_travel_itineraries.txt'; 
  a.click(); 
  URL.revokeObjectURL(url); 
  showToast('Itineraries exported to sofias_travel_itineraries.txt');
} 

function renderDashboard(){ 
  // 1. CHECK IF USER IS LOGGED IN
  if(!state.user){ 
    // FIX: Render a "Guest View" so the screen isn't empty (White Space)
    setMain(`
        <div style="min-height: 60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center;">
            <div style="width:80px; height:80px; background:#f1f5f9; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                <i class="fa-solid fa-lock" style="font-size:2rem; color:#94a3b8;"></i>
            </div>
            <h2 style="color:#334155; margin-bottom:10px;">Dashboard Locked</h2>
            <p class="small muted" style="margin-bottom:25px;">Please sign in to access your bookings and settings.</p>
            <button class="btn" onclick="openSignInModal()">Open Login</button>
        </div>
    `);
    
    // Automatically open the modal too
    setTimeout(() => openSignInModal(), 500); 
    return; 
  } 

  // 2. CHECK ROLES
  if(state.user.role==='admin'){ 
    renderAdminDashboard(); 
    return; 
  } 
  if(state.user.role==='operator'){ 
    renderOperatorDashboard(); 
    return; 
  } 

  // 3. RENDER TRAVELER DASHBOARD (Existing Logic)
  renderTravelerDashboard(); 
}

function cancelBooking(bookingId) {
    if (!confirm(`Are you sure you want to cancel booking ${bookingId}? The full package price will be refunded (mock). This action cannot be undone.`)) {
        return;
    }
    const bookingIndex = state.bookings.findIndex(b => b.id === bookingId);
    if (bookingIndex !== -1) {
        const packagePrice = state.bookings[bookingIndex].totalPrice || state.packages.find(p => p.id === state.bookings[bookingIndex].packageId).price.toFixed(2);
        state.bookings[bookingIndex].status = 'cancelled';
        showToast(`Booking ${bookingId} has been successfully cancelled. A refund of $${packagePrice} (mock) is being processed.`);
        renderDashboard(); 
    } else {
        showToast('Booking not found.');
    }
}

function updateProfile() {
    const newName = document.getElementById('profileName').value;
    const newEmail = document.getElementById('profileEmail').value;
    const newPhone = document.getElementById('profilePhone').value;
    const newBio = document.getElementById('profileBio').value;

    state.user.name = newName;
    state.user.email = newEmail;
    state.user.phone = newPhone;
    state.user.bio = newBio;

// 2. Handle Image Update (from the Settings file input)
    const fileInput = document.getElementById('settingsProfileUpload');
    
    if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Save new avatar to state (Replaces the 'S' with the image)
            state.user.avatar = e.target.result;
            
            // Refresh UI Components
            applyProfileUpdates("Profile picture and details updated!");
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        // No image selected, just text updates (Updates the 'S' to new initial)
        applyProfileUpdates("Profile details updated successfully!");
    }

        showToast('Profile updated successfully!');
    renderTravelerDashboard();
    updateAuthUI(); // Refresh header
}


function switchDashboardTab(tab) {
    currentDashboardTab = tab;
    renderTravelerDashboard();
}


/* --- PROFESSIONAL DASHBOARD RENDERER --- */
function renderTravelerDashboard() {
    const user = state.user;
    const bookings = state.bookings.filter(b => b.email === user.email);
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const points = user.loyaltyPoints || 0;

    // Determine content based on tab, but wrap in GRID layout
    let mainContent = '';

    if (currentDashboardTab === 'overview') {
        mainContent = `
            <div class="content-grid">
                <div class="dash-widget span-3" style="background: linear-gradient(135deg, var(--accent), #0b3d5e); color:white; border:none; flex-direction:row; align-items:center; justify-content:space-between;">
                    <div>
                        <h2 style="margin:0; color:white;">${getGreeting()}, ${user.name.split(' ')[0]}!</h2>
                        <p style="opacity:0.9; margin:5px 0 0 0;">You have ${activeBookings} upcoming trips. Ready to explore?</p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:2.5rem; font-weight:800;">${points}</div>
                        <div style="font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; opacity:0.8;">Points</div>
                    </div>
                </div>

                <div class="dash-widget span-2">
                    <div class="widget-header">
                        <div class="widget-title">Current Itinerary</div>
                        <button class="text-btn" onclick="currentDashboardTab='history'; renderTravelerDashboard();">View All</button>
                    </div>
                    ${bookings.length > 0 ? `
                        <div style="display:flex; gap:15px; overflow-x:auto; padding-bottom:10px;">
                           ${bookings.slice(0,3).map(b => `
                               <div style="min-width:200px; padding:15px; border:1px solid #eee; border-radius:8px; background:#f8f9fa;">
                                   <div style="font-weight:700; color:var(--accent);">${b.packageTitle}</div>
                                   <div class="small muted">${b.date}</div>
                                   <span class="badge status-${b.status}" style="font-size:0.7rem; margin-top:5px;">${b.status}</span>
                               </div>
                           `).join('')}
                        </div>
                    ` : `<div class="empty-state" style="padding:20px;">No upcoming trips. <a href="#packages">Book now!</a></div>`}
                </div>

                <div class="dash-widget">
                    <div class="widget-header"><div class="widget-title">Weather</div></div>
                    <div style="text-align:center; padding:10px;">
                        <i class="fa-solid fa-cloud-sun" style="font-size:3rem; color:#f59e0b;"></i>
                        <h3 style="margin:10px 0;">32°C</h3>
                        <p class="small muted">Manila, PH<br>Partly Cloudy</p>
                    </div>
                </div>

                <div class="dash-widget span-2">
                    <div class="widget-header"><div class="widget-title">Travel Spending (6 Months)</div></div>
                    <div class="chart-box">
                        <canvas id="userSpendingChart"></canvas>
                    </div>
                </div>

                <div class="dash-widget" style="background:#fffbeb; border-color:#fcd34d;">
                    <div class="widget-header"><div class="widget-title" style="color:#b45309;">💡 Travel Tip</div></div>
                    <p style="font-size:0.9rem; line-height:1.6; color:#78350f;">
                        Always book your ferry tickets for Boracay at least 2 days in advance during peak season to avoid queues.
                    </p>
                </div>
            </div>
        `;
    } else if (currentDashboardTab === 'history') {
        mainContent = getHistoryView(bookings); // Keep existing, but it fits in fluid col
    } else if (currentDashboardTab === 'profile') {
        mainContent = getSettingsView();
    } else if (currentDashboardTab === 'wishlist') {
        mainContent = getWishlistView(state.wishlist.length);
    } else {
        mainContent = getSupportView();
    }

    setMain(`
        <div class="dashboard-grid-layout">
            <aside class="dash-sidebar">
                <div class="user-profile-widget">
                    <img src="${user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}" class="user-profile-img">
                    <h3 style="margin:0; font-size:1.2rem;">${user.name}</h3>
                    <p class="small muted">${user.email}</p>
                    <button class="btn small-btn ghost" style="color:#333; border-color:#ddd; margin-top:10px;" onclick="openProfileSettings()">Edit Profile</button>
                </div>
                <nav style="padding:15px;">
                    ${['overview', 'history', 'wishlist', 'profile', 'support'].map(tab => `
                        <button class="dash-menu-btn ${currentDashboardTab === tab ? 'active' : ''}" 
                                onclick="currentDashboardTab='${tab}'; renderTravelerDashboard();">
                            ${capitalize(tab)}
                        </button>
                    `).join('')}
                    <div style="height:1px; background:#f1f3f5; margin:10px 0;"></div>
                    <button class="dash-menu-btn" onclick="mockSignOut()" style="color:#dc3545;">Sign Out</button>
                </nav>
            </aside>

            <main>
                ${mainContent}
            </main>
        </div>
    `);

    // Initialize Chart if on Overview
    if (currentDashboardTab === 'overview') {
        setTimeout(initUserChart, 100);
    }
}

// Helper for User Chart
function initUserChart() {
    const ctx = document.getElementById('userSpendingChart');
    if(!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
            datasets: [{
                label: 'Spending ($)',
                data: [120, 300, 150, 450, 200, 350],
                backgroundColor: '#38bdf8',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } }
        }
    });
}

// --- COMPLETE DASHBOARD LOGIC START ---

// Helper to calculate greeting based on time
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}

// Helper function for Accordion Toggle
function toggleFaq(element) {
    const content = element.nextElementSibling;
    const parent = element.parentElement;
    
    // Close others
    document.querySelectorAll('.faq-content').forEach(c => {
        if (c !== content) {
            c.style.maxHeight = null;
            c.classList.remove('open');
        }
    });

    if (content.style.maxHeight) {
        content.style.maxHeight = null;
        content.classList.remove('open');
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
        content.classList.add('open');
    }
}
/* --- PROFESSIONAL ADMIN DASHBOARD (NO WHITE SPACE) --- */
/* --- FIXED ADMIN DASHBOARD CONTROLLER --- */
let currentAdminView = 'overview'; // State tracker

function renderAdminDashboard() {
    // 1. Determine Main Content based on current View
    let mainContentHtml = '';

    if (currentAdminView === 'overview') {
        // Render the Overview Widgets (Revenue, Destination Chart, etc.)
        mainContentHtml = renderAdminOverviewBlock();
    } 
    else if (currentAdminView === 'analytics') {
        // Render the Analytics Charts
        mainContentHtml = renderAdminAnalyticsBlock();
    } 
    else if (currentAdminView === 'bookings') {
        // Render the Full Bookings Table
        mainContentHtml = renderAdminBookingsBlock();
    }

    // 2. Render the Skeleton (Sidebar + Main Area)
    setMain(`
        <div class="dashboard-grid-layout"> 
            <aside class="dash-sidebar" style="background:#0f172a; color:white; border:none;">
                <div style="padding:25px; font-weight:800; font-size:1.2rem; letter-spacing:1px; border-bottom:1px solid rgba(255,255,255,0.1);">
                    <i class="fa-solid fa-shield-halved"></i> ADMIN
                </div>
                <nav style="padding:15px 10px;">
                    <button class="dash-menu-btn ${currentAdminView==='overview'?'active':''}" style="color:${currentAdminView==='overview'?'#38bdf8':'#cbd5e1'};" onclick="currentAdminView='overview'; renderAdminDashboard()">
                        <i class="fa-solid fa-chart-line"></i> Dashboard
                    </button>
                    <button class="dash-menu-btn ${currentAdminView==='analytics'?'active':''}" style="color:${currentAdminView==='analytics'?'#38bdf8':'#cbd5e1'};" onclick="currentAdminView='analytics'; renderAdminDashboard()">
                        <i class="fa-solid fa-chart-pie"></i> Analytics
                    </button>
                    <button class="dash-menu-btn ${currentAdminView==='bookings'?'active':''}" style="color:${currentAdminView==='bookings'?'#38bdf8':'#cbd5e1'};" onclick="currentAdminView='bookings'; renderAdminDashboard()">
                        <i class="fa-solid fa-ticket"></i> Bookings
                    </button>
                    <div style="margin-top:50px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px;">
                         <button class="dash-menu-btn" style="color:#ef4444;" onclick="mockSignOut()">
                            <i class="fa-solid fa-right-from-bracket"></i> Logout
                         </button>
                    </div>
                </nav>
            </aside>

            <main>
                ${mainContentHtml}
            </main>
        </div>
    `);
    
    // 3. Initialize Charts (Only if the view needs them)
    setTimeout(() => {
        initAdminCharts(currentAdminView);
    }, 100);
}

/* --- HELPER: Render Overview HTML --- */
function renderAdminOverviewBlock() {
    const revenue = 125000;
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
            <div><h1 style="margin:0; font-size:1.8rem;">Admin Overview</h1></div>
            <button class="btn secondary small-btn"><i class="fa-solid fa-download"></i> Download Report</button>
        </div>

        <div class="kpi-row">
            <div class="kpi-box">
                <div class="small muted">Total Revenue</div>
                <div style="font-size:1.8rem; font-weight:800;">$${revenue.toLocaleString()}</div>
                <div style="color:#22c55e; font-size:0.8rem;">▲ 12% vs last month</div>
            </div>
            <div class="kpi-box" style="border-left-color:#22c55e;">
                <div class="small muted">Active Bookings</div>
                <div style="font-size:1.8rem; font-weight:800;">${state.bookings.length}</div>
            </div>
            <div class="kpi-box" style="border-left-color:#ef4444;">
                <div class="small muted">Pending Issues</div>
                <div style="font-size:1.8rem; font-weight:800;">3</div>
            </div>
        </div>

        <div class="content-grid">
            <div class="dash-widget span-2">
                <div class="widget-header"><div class="widget-title">Revenue Trends</div></div>
                <div class="chart-box"><canvas id="adminRevenueChart"></canvas></div>
            </div>
            <div class="dash-widget">
                 <div class="widget-header"><div class="widget-title">Destinations</div></div>
                 <div class="chart-box"><canvas id="adminDestChart"></canvas></div>
            </div>
        </div>
    `;
}

/* --- HELPER: Render Analytics HTML --- */
function renderAdminAnalyticsBlock() {
    return `
        <h1 style="margin:0 0 30px 0; font-size:1.8rem;">Deep Dive Analytics</h1>
        <div class="content-grid">
            <div class="dash-widget span-2">
                <div class="widget-header"><div class="widget-title">Booking Volume (Weekly)</div></div>
                <div class="chart-box"><canvas id="volumeChart"></canvas></div>
            </div>
            <div class="dash-widget">
                <div class="widget-header"><div class="widget-title">User Demographics</div></div>
                <div class="chart-box"><canvas id="demoPieChart"></canvas></div>
            </div>
        </div>
    `;
}

/* --- HELPER: Render Bookings Table HTML --- */
function renderAdminBookingsBlock() {
    return `
        <h1 style="margin:0 0 30px 0; font-size:1.8rem;">All Bookings Management</h1>
        <div class="dash-widget span-3">
            <table style="width:100%; text-align:left; border-collapse:collapse; font-size:0.9rem;">
                <thead style="background:#f8f9fa; border-bottom:2px solid #eee;">
                    <tr>
                        <th style="padding:15px;">ID</th>
                        <th>Traveler</th>
                        <th>Package</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.bookings.map(b => `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:15px; font-family:monospace;">${b.id}</td>
                            <td>
                                <b>${b.traveler}</b><br>
                                <span class="small muted">${b.email}</span>
                            </td>
                            <td>${b.packageTitle}</td>
                            <td>${b.date}</td>
                            <td><span class="badge status-${b.status}">${b.status}</span></td>
                            <td>
                                <button class="btn small-btn secondary" onclick="showToast('Booking Approved')">Approve</button>
                                <button class="btn small-btn" style="background:#fee2e2; color:#ef4444; border:none;" onclick="cancelBooking('${b.id}')">Cancel</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
/* --- HELPER FUNCTIONS FOR ADMIN VIEWS --- */

function renderAdminOverview(revenue, bookingsCount, revGrowth, userGrowth) {
    return `
        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-label">Total Revenue</div>
                <div class="kpi-value">$${revenue.toLocaleString()}</div>
                <div class="kpi-trend up"><i class="fa-solid fa-arrow-trend-up"></i> ${revGrowth}% vs last month</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Confirmed Bookings</div>
                <div class="kpi-value">${bookingsCount}</div>
                <div class="kpi-trend up"><i class="fa-solid fa-arrow-trend-up"></i> ${userGrowth}% vs last month</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Pending Reviews</div>
                <div class="kpi-value">5</div>
                <div class="kpi-trend down" style="color:#f59e0b;"><i class="fa-solid fa-circle-exclamation"></i> Action required</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Avg. Order Value</div>
                <div class="kpi-value">$${bookingsCount > 0 ? (revenue / bookingsCount).toFixed(0) : 0}</div>
                <div class="small muted">Per booking</div>
            </div>
        </div>

        <div class="charts-section">
            <div class="chart-card">
                <div class="chart-header">
                    <h3 style="margin:0; font-size:1.1rem;">Revenue Performance</h3>
                    <select style="border:1px solid #e2e8f0; padding:4px 8px; border-radius:4px; font-size:0.8rem;">
                        <option>This Year</option>
                        <option>Last Year</option>
                    </select>
                </div>
                <canvas id="revenueChart" height="250"></canvas>
            </div>
            <div class="chart-card">
                <div class="chart-header">
                    <h3 style="margin:0; font-size:1.1rem;">Device Usage</h3>
                </div>
                <canvas id="deviceChart" height="200"></canvas>
            </div>
        </div>

        <h3 style="margin-bottom:15px; font-size:1.1rem; color:#1e293b;">Recent Transactions</h3>
        <div class="table-card">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Customer</th>
                        <th>Package</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.bookings.slice().reverse().slice(0, 5).map(b => `
                        <tr>
                            <td style="font-family:monospace; color:#64748b;">#${b.id.toString().slice(-8)}</td>
                            <td>
                                <div style="font-weight:600; color:#0f172a;">${b.traveler}</div>
                                <div style="font-size:0.75rem; color:#64748b;">${b.email}</div>
                            </td>
                            <td>${b.packageTitle}</td>
                            <td>${b.date}</td>
                            <td style="font-weight:700;">$${b.totalPrice}</td>
                            <td><span class="status-badge ${b.status}">${b.status}</span></td>
                            <td><button class="action-btn">View</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderAdminAnalytics() {
    return `
        <div class="charts-section" style="grid-template-columns: 1fr 1fr;">
            <div class="chart-card">
                <h3 style="margin-bottom:15px;">Top Destinations</h3>
                <canvas id="destBarChart"></canvas>
            </div>
            <div class="chart-card">
                <h3 style="margin-bottom:15px;">Customer Demographics</h3>
                <canvas id="demoPieChart"></canvas>
            </div>
        </div>
        
        <div class="chart-card">
            <h3 style="margin-bottom:15px;">Booking Volume (Weekly)</h3>
            <canvas id="volumeChart" height="80"></canvas>
        </div>
    `;
}

function renderAdminFeedback() {
    // Flatten comments logic
    let allComments = [];
    Object.keys(state.comments).forEach(destId => {
        const destName = state.destinations.find(d => d.id === destId)?.name || destId;
        state.comments[destId].forEach(c => allComments.push({ ...c, destName }));
    });

    return `
        <div class="table-card">
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Destination</th>
                        <th>Comment</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allComments.length > 0 ? allComments.map(c => `
                        <tr>
                            <td style="font-weight:600;">${c.user}</td>
                            <td>${c.destName}</td>
                            <td style="color:#475569; max-width:350px;">"${c.text}"</td>
                            <td>${c.date}</td>
                            <td>
                                <div style="display:flex; gap:5px;">
                                    <button class="action-btn" title="Approve"><i class="fa-solid fa-check" style="color:#10b981;"></i></button>
                                    <button class="action-btn" title="Delete"><i class="fa-solid fa-trash" style="color:#ef4444;"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="5" style="text-align:center; padding:30px;">No feedback found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function initAdminCharts(view) {
    // Destroy old charts to prevent "Canvas is already in use" errors if you refresh logic is added
    // For prototype, we just verify canvas exists
    
    if (view === 'overview') {
        const ctxRev = document.getElementById('adminRevenueChart');
        if(ctxRev) {
            new Chart(ctxRev, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{ label: 'Revenue', data: [12000, 19000, 15000, 25000, 22000, 30000], borderColor: '#38bdf8', tension: 0.4 }]
                }
            });
        }
        const ctxDest = document.getElementById('adminDestChart');
        if(ctxDest) {
            new Chart(ctxDest, {
                type: 'doughnut',
                data: {
                    labels: ['Boracay', 'El Nido', 'Siargao'],
                    datasets: [{ data: [55, 35, 10], backgroundColor: ['#0f172a', '#38bdf8', '#cbd5e1'] }]
                }
            });
        }
    } 
    else if (view === 'analytics') {
        const ctxVol = document.getElementById('volumeChart');
        if(ctxVol) {
            new Chart(ctxVol, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{ label: 'Bookings', data: [12, 19, 3, 5, 2, 3, 15], backgroundColor: '#10b981' }]
                }
            });
        }
        const ctxDemo = document.getElementById('demoPieChart');
        if(ctxDemo) {
            new Chart(ctxDemo, {
                type: 'pie',
                data: {
                    labels: ['Families', 'Couples', 'Solo'],
                    datasets: [{ data: [40, 40, 20], backgroundColor: ['#f59e0b', '#ec4899', '#6366f1'] }]
                }
            });
        }
    }
}

/* --- PROFESSIONAL REPORTS & ANALYTICS MODULE (ADMIN) --- */


function renderAdmin() {
    // Security Check
    if (!state.user || state.user.role !== 'admin') {
        setMain(`
            <div class="card center" style="max-width:500px; margin:50px auto; padding: 40px;">
                <div style="font-size:3rem; margin-bottom:15px;">🔒</div>
                <h2 style="color:var(--danger); margin-bottom: 10px;">Restricted Access</h2>
                <p class="small muted">This module is for Administrators and Operators only.</p>
                <div style="height:20px"></div>
                <button class="btn" onclick="mockSignIn('admin','admin@example.com')">
                    <i class="fa-solid fa-key"></i> Login as Admin
                </button>
            </div>
        `);
        return;
    }
    renderAdminDashboard();
}

function renderAuth() {
    setMain(`
        <div class="card center" style="max-width:500px; margin:30px auto; padding:30px;">
            <h2 style="color:var(--accent); margin-bottom: 10px;">Authentication</h2>
            <p class="small muted">Please use the 'Log In' button in the header to access your account.</p>
            <div style="height:15px"></div>
            <button class="btn" onclick="openSignInModal()">Open Sign In</button>
        </div>
    `);
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }


// Run on page load
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();
  window.addEventListener('hashchange', route);
  
  // 1. Render content immediately
  route(); 

  // 2. EXTEND PRELOADER SLIGHTLY
  // This keeps the white screen up for 0.8 seconds to hide any layout jumping
  const preloader = document.getElementById('preloader');
  if(preloader) {
      // Force it to be visible first
      preloader.style.opacity = 1;
      preloader.style.display = 'flex';

      setTimeout(() => {
          preloader.style.opacity = 0;
          setTimeout(() => preloader.style.display = 'none', 500);
      }, 800); // 800ms delay gives the CSS time to lock the text in the center
  }

  updateAuthUI();
  setFixedBackground();
});

/* --- FIXED ROUTING & CHAT VISIBILITY --- */
/* --- FIXED ROUTING (Instant Chat Hide) --- */
function route(){
    const fullHash = location.hash || '#home';
    const parts = fullHash.split('-'); 
    const baseHash = parts[0]; 
    const id = parts.length > 1 && baseHash === '#booking' ? parseInt(parts[1]) : null;

    const page = routes[baseHash] || routes['#home'];

    // 1. Render Page Content
    if (baseHash === '#booking' && id) {
        page(id);
    } else {
        page();
    }

    // 2. CHAT VISIBILITY LOGIC (Instant Version)
    const chatTrigger = document.getElementById('chat-trigger');
    const chatWidget = document.getElementById('chat-widget');
    
    if (chatTrigger) {
        // Condition 1: Hide on Homepage
        const isHomePage = (baseHash === '#home' || baseHash === '');
        
        // Condition 2: Hide on Account Page IF NOT Logged In
        const isGuestOnAccount = (baseHash === '#dashboard' && !state.user);

        if (isHomePage || isGuestOnAccount) {
            // INSTANT HIDE (No animation delay)
            chatTrigger.style.display = 'none'; 
            chatTrigger.classList.remove('visible'); 
            
            // Force close the widget window if it was open
            if (chatWidget) chatWidget.classList.remove('active'); 
            
        } else {
            // SHOW (Fade in)
            chatTrigger.style.display = 'flex'; 
            // Small delay (10ms) is still needed here to allow the fade-in animation to trigger
            setTimeout(() => chatTrigger.classList.add('visible'), 10); 
        }
    }

    // 3. Scroll to top
    window.scrollTo(0, 0);
}

/* --- ENHANCED MAP MODAL & ROUTING LOGIC --- */
let mapInstance = null;
let currentRouteLayer = null;
let markersLayer = L.layerGroup(); 

function openMapModal() {
    document.getElementById('mapModalOverlay').style.display = 'flex';
    if(!mapInstance) initMap();
    
    // Fix gray map issue
    setTimeout(() => {
        if(mapInstance) mapInstance.invalidateSize();
    }, 200);
}

function closeMapModal() {
    document.getElementById('mapModalOverlay').style.display = 'none';
}

/* --- PROFESSIONAL MAP LOGIC --- */
/* --- ENHANCED MAP WITH ROUTE PLANNER --- */
function initMap() {
    if (mapInstance) return;

    mapInstance = L.map('interactiveMap', { zoomControl: false }).setView([12.8797, 121.7740], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(mapInstance);
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    // --- RENDER SIDEBAR WITH TABS (Destinations vs Route) ---
    const sidebar = document.querySelector('.map-sidebar');
    
    // Inject Tab Structure
    sidebar.innerHTML = `
        <div class="map-sidebar-header">
            <h3 style="margin:0; color:white;">Explore</h3>
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="switchMapTab('dest')" class="btn small-btn secondary" style="flex:1; background:rgba(255,255,255,0.2); color:white; border:none;">Destinations</button>
                <button onclick="switchMapTab('route')" class="btn small-btn secondary" style="flex:1; background:rgba(255,255,255,0.2); color:white; border:none;">Route Planner</button>
            </div>
        </div>
        
        <div id="tab-dest" class="map-dest-list" style="display:block;">
            <ul id="mapDestList" style="list-style:none; padding:0; margin:0;"></ul>
        </div>

        <div id="tab-route" class="map-dest-list" style="display:none; padding:20px;">
            <label style="font-size:0.8rem; font-weight:700;">Start Point</label>
            <select id="routeStart" style="width:100%; margin-bottom:10px; padding:8px;">
                <option value="user_loc">My Location (Manila)</option>
                ${state.destinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>

            <label style="font-size:0.8rem; font-weight:700;">Destination</label>
            <select id="routeEnd" style="width:100%; margin-bottom:10px; padding:8px;">
                ${state.destinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
            </select>

            <label style="font-size:0.8rem; font-weight:700;">Transport Mode</label>
            <select id="transportMode" style="width:100%; margin-bottom:20px; padding:8px;">
                <option value="flight">Flight (Direct)</option>
                <option value="ferry">Ferry / Boat</option>
                <option value="bus">Bus / RORO</option>
            </select>

            <button class="btn" style="width:100%;" onclick="calculateRoute()">Show Route</button>
            
            <div id="routeResult" style="margin-top:20px; font-size:0.9rem; color:#333;"></div>
        </div>
        
        <div style="padding:15px; background:#e9ecef;">
            <button class="btn small-btn" style="width:100%" onclick="closeMapModal()">Close Map</button>
        </div>
    `;

    // Populate Destination List (Tab 1)
    const listContainer = document.getElementById('mapDestList');
    state.destinations.forEach(d => {
        const li = document.createElement('li');
        li.className = 'map-dest-item';
        li.innerHTML = `
            <img src="${d.image}" alt="${d.name}">
            <div>
                <div style="font-weight:700; color:#333;">${d.name}</div>
                <div style="font-size:0.75rem; color:#666;">${d.province}</div>
            </div>`;
        li.onclick = () => flyToDest(d.id, mapData[d.id].coords);
        listContainer.appendChild(li);

        // Add Marker
        if(mapData[d.id]) {
            L.marker(mapData[d.id].coords).addTo(mapInstance).bindPopup(`<b>${d.name}</b>`);
        }
    });
}

/* Helper to Switch Tabs in Map */
window.switchMapTab = function(tabName) {
    document.getElementById('tab-dest').style.display = tabName === 'dest' ? 'block' : 'none';
    document.getElementById('tab-route').style.display = tabName === 'route' ? 'block' : 'none';
}

/* Helper to Calculate Route */
window.calculateRoute = function() {
    const startVal = document.getElementById('routeStart').value;
    const endVal = document.getElementById('routeEnd').value;
    const mode = document.getElementById('transportMode').value;
    
    let startCoords = startVal === 'user_loc' ? [14.5995, 120.9842] : mapData[startVal].coords;
    let endCoords = mapData[endVal].coords;

    // Clear old lines
    if(currentRouteLayer) mapInstance.removeLayer(currentRouteLayer);

    // Style line based on mode
    let color = '#3388ff';
    let dash = null;
    if(mode === 'ferry') { color = '#10b981'; dash = '10, 10'; }
    if(mode === 'flight') { color = '#ef4444'; dash = '5, 15'; }

    // Draw Line
    currentRouteLayer = L.polyline([startCoords, endCoords], { color: color, weight: 4, dashArray: dash }).addTo(mapInstance);
    mapInstance.fitBounds(currentRouteLayer.getBounds(), { padding: [50, 50] });

    document.getElementById('routeResult').innerHTML = `
        <strong>Route Calculated!</strong><br>
        Mode: ${mode.toUpperCase()}<br>
        Distance: ${(Math.random() * 500 + 50).toFixed(0)} km<br>
        Est. Time: ${(Math.random() * 5 + 1).toFixed(1)} hrs
    `;
}

function flyToDest(id, coords) {
    // Highlight list item
    document.querySelectorAll('.map-dest-item').forEach(el => el.classList.remove('active'));
    // (Optional: add active class logic here based on click target)
    
    mapInstance.flyTo(coords, 10, { duration: 1.5 });
    
    // Draw connections (Mock Route) from Manila (User) to Dest
    if(currentRouteLayer) mapInstance.removeLayer(currentRouteLayer);
    
    const manilaCoords = [14.5995, 120.9842];
    const path = [manilaCoords, coords];
    
    currentRouteLayer = L.polyline(path, {
        color: '#ffc107',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 10'
    }).addTo(mapInstance);
}

// Fix Map Gray Area on Open
function openMapModal() {
    document.getElementById('mapModalOverlay').style.display = 'flex';
    if(!mapInstance) initMap();
    setTimeout(() => { mapInstance.invalidateSize(); }, 200);
}

function updateAttractionsList(destId) {
    // 1. CLEAR THE ROUTE LINE (Fixes the "connected" issue)
    if(currentRouteLayer) {
        mapInstance.removeLayer(currentRouteLayer);
        currentRouteLayer = null;
        document.getElementById('routeResult').innerHTML = '';
    }

    const list = document.getElementById('mapAttractionsList');
    list.innerHTML = ''; 
    
    // 2. Sync the End Point Dropdown
    const endSel = document.getElementById('routeEnd');
    if(endSel) endSel.value = destId;

    const data = mapData[destId];
    if (data && data.attractions) {
        // 3. Pan Map to Destination
        mapInstance.flyTo(data.coords, 10);

        // 4. Fill Sidebar List
        data.attractions.forEach(att => {
            const li = document.createElement('li');
            li.className = 'attraction-item';
            li.innerHTML = `<span class="attraction-icon">📷</span> ${att.name}`;
            li.onclick = () => {
                mapInstance.flyTo([att.lat, att.lng], 14);
                L.popup().setLatLng([att.lat, att.lng]).setContent(att.name).openOn(mapInstance);
            };
            list.appendChild(li);
        });
    } else {
        list.innerHTML = '<li style="padding:5px; color:#999;">Select a destination to see attractions.</li>';
    }
}

function selectDestination(id) {
    updateAttractionsList(id);
}

function calculateRoute() {
    const startId = document.getElementById('routeStart').value;
    const endId = document.getElementById('routeEnd').value;
    const mode = document.getElementById('transportMode').value;
    
    if(!startId || !endId) {
        showToast("Please make sure both Start and End points are selected.");
        return;
    }
    if(startId === endId) {
        showToast("You are already at this location!");
        return;
    }

    // Determine Start Coordinates
    let startCoords;
    if (startId === 'user_loc') {
        // Mock User Location (Manila)
        startCoords = [14.5995, 120.9842]; 
    } else {
        startCoords = mapData[startId].coords;
    }

    const endCoords = mapData[endId].coords;

    // Clear previous line
    if(currentRouteLayer) mapInstance.removeLayer(currentRouteLayer);

    // Style Styling
    let dashArray = null; 
    let color = '#0f4c75'; 
    let speed = 60; 
    
    if(mode === 'walking') {
        dashArray = '5, 10'; 
        color = '#28a745'; 
        speed = 5;
    } else if (mode === 'public') {
        dashArray = '15, 15'; 
        color = '#dc3545'; 
        speed = 40;
    }

    // Draw New Line
    currentRouteLayer = L.polyline([startCoords, endCoords], {
        color: color,
        weight: 5,
        opacity: 0.8,
        dashArray: dashArray
    }).addTo(mapInstance);

    mapInstance.fitBounds(currentRouteLayer.getBounds(), {padding: [50,50]});

    // Mock Info
    let dist;
    if (startId === 'user_loc') {
        dist = (Math.random() * 400 + 100).toFixed(1); 
    } else {
        dist = (Math.random() * 100 + 10).toFixed(1);
    }
    const time = (dist / speed).toFixed(1);
    
    document.getElementById('routeResult').innerHTML = `
        <div style="border-top:1px solid #eee; padding-top:10px;">
            <div><i class="fa-solid fa-route"></i> Distance: <strong>${dist} km</strong></div>
            <div><i class="fa-solid fa-clock"></i> Est. Time: <strong>${time} hrs</strong></div>
            <div style="font-size:0.8rem; color:#666; margin-top:5px;">via ${mode.charAt(0).toUpperCase() + mode.slice(1)}</div>
        </div>
    `;
}

function openSpecificMap(destId) {
    openMapModal();
    setTimeout(() => {
        updateAttractionsList(destId);
    }, 300);
}

// --- Profile Picture Logic ---
function triggerProfileUpload() {
    // Trigger the hidden file input
    document.getElementById('profileUpload').click();
}

function handleProfileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Save the new image URL to the user state
            if(state.user) {
                state.user.avatar = e.target.result;
                updateAuthUI(); // Refresh header
                // If dashboard is active, refresh it to show new pic there too
                if(currentDashboardTab === 'profile' && location.hash === '#dashboard') {
                    renderTravelerDashboard();
                }
                showToast("Profile picture updated!");
            }
        };
        reader.readAsDataURL(file);
    }
}

// --- Currency & Dropdown Logic ---
state.currency = 'PHP'; // Default currency

function toggleCurrencyDropdown() {
    const menu = document.getElementById('currencyDropdown');
    menu.classList.toggle('visible');
    
    // Close user dropdown if open
    document.getElementById('userDropdownMenu').classList.remove('visible');
}

function setCurrency(code) {
    state.currency = code;
    updateAuthUI(); // Update the header text (e.g. PHP -> USD)
    
    // Force refresh the current page to update all prices
    route(); 
    
    showToast(`Currency changed to ${code}`);
}

// Update the existing toggleDropdown to close currency menu if open
const originalToggleDropdown = toggleDropdown;
toggleDropdown = function() {
    const menu = document.getElementById('userDropdownMenu');
    menu.classList.toggle('visible');
    
    // Close currency dropdown if open
    const curMenu = document.getElementById('currencyDropdown');
    if(curMenu) curMenu.classList.remove('visible');
}

// Close menus when clicking outside
document.addEventListener('click', (e) => {
    const curMenu = document.getElementById('currencyDropdown');
    const curBtn = document.querySelector('.currency-selector');
    
    if (curMenu && curMenu.classList.contains('visible')) {
        if (!curMenu.contains(e.target) && !curBtn.contains(e.target)) {
            curMenu.classList.remove('visible');
        }
    }
});
// --- Navigation Helper ---
function openProfileSettings() {
    // 1. Set the active tab to 'profile'
    currentDashboardTab = 'profile';
    
    // 2. Force navigation to dashboard
    navigateTo('#dashboard');
    
    // 3. If already on dashboard, manually trigger re-render to switch tabs immediately
    if(location.hash === '#dashboard') {
        renderTravelerDashboard();
    }
    
    // 4. Close the dropdown
    const menu = document.getElementById('userDropdownMenu');
    if(menu) menu.classList.remove('visible');
}

/* --- MOBILE MENU TOGGLE --- */
function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    // Toggle the 'active' class which sets display: flex on mobile
    nav.classList.toggle('active');
}

// Helper to render the CSS Bar Chart
function renderSpendingChart() {
    // Mock Data for the last 6 months
    const data = [
        { month: 'Jun', value: 40 },
        { month: 'Jul', value: 65 },
        { month: 'Aug', value: 30 },
        { month: 'Sep', value: 85 },
        { month: 'Oct', value: 50 },
        { month: 'Nov', value: 90 } // Current high
    ];
    
    return `
        <div style="margin-top:20px;">
            <h4 style="margin:0 0 10px 0; color:#64748b;">6-Month Spending Trends</h4>
            <div class="chart-container">
                ${data.map(d => `
                    <div class="chart-bar" style="height:${d.value}%" data-month="${d.month}" title="$${d.value * 10}"></div>
                `).join('')}
            </div>
        </div>
    `;
}

// 1. Overview Tab
function getOverviewView(points, activeBookings, wishlistCount) {
    return `
        <div class="dash-header">
            <div>
                <h2 style="margin:0; color:#1e293b;">${getGreeting()}, ${state.user.name.split(' ')[0]}!</h2>
                <p style="margin:5px 0 0 0; color:#64748b;">Here's what's happening with your travel plans.</p>
            </div>
            <div style="text-align:right;">
                <button class="btn" onclick="navigateTo('#packages')">+ New Trip</button>
            </div>
        </div>

        <div class="dash-stats-grid">
            <div class="dash-stat-card">
                <div style="color:#64748b; font-size:0.9rem; font-weight:600;">Total Points</div>
                <div style="font-size:2rem; font-weight:800; color:var(--accent); margin:5px 0;">${points}</div>
                <div style="font-size:0.8rem; color:#22c55e;">+120 this month</div>
            </div>
            <div class="dash-stat-card">
                <div style="color:#64748b; font-size:0.9rem; font-weight:600;">Upcoming Trips</div>
                <div style="font-size:2rem; font-weight:800; color:#334155; margin:5px 0;">${activeBookings}</div>
                <div style="font-size:0.8rem; color:#64748b;">Pack your bags!</div>
            </div>
            <div class="dash-stat-card">
                <div style="color:#64748b; font-size:0.9rem; font-weight:600;">Wishlist</div>
                <div style="font-size:2rem; font-weight:800; color:#e11d48; margin:5px 0;">${wishlistCount}</div>
                <div style="font-size:0.8rem; color:#64748b;">Saved destinations</div>
            </div>
        </div>

        <div class="grid" style="grid-template-columns: 2fr 1fr; gap:30px;">
            <div class="dash-stat-card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">Travel Analytics</h3>
                    <select style="border:1px solid #e2e8f0; padding:5px; border-radius:6px;">
                        <option>Last 6 Months</option>
                        <option>This Year</option>
                    </select>
                </div>
                ${renderSpendingChart()}
            </div>

            <div class="dash-stat-card" style="background: linear-gradient(180deg, #fffbeb 0%, #fff 100%); border-color:#fcd34d;">
                <h3 style="margin-top:0; color:#b45309;">💡 Pro Tip</h3>
                <p style="font-size:0.95rem; line-height:1.6; color:#78350f;">
                    Book your flights 3 months in advance to get the best deals on island hopping tours. Don't forget sunscreen!
                </p>
                <button class="btn secondary small-btn" style="width:100%; margin-top:10px;">Read More Tips</button>
            </div>
        </div>
    `;
}

// 2. Bookings Tab
function getHistoryView(travelerBookings) {
    if (travelerBookings.length === 0) {
        return `
            <h2 style="margin-top:0;">My Bookings</h2>
            <div class="empty-state-card">
                <i class="fa-solid fa-plane-departure" style="font-size: 3rem; color: #d1d5db; margin-bottom: 15px;"></i>
                <h3 style="margin:0; color: #4b5563;">No adventures yet</h3>
                <p class="small muted" style="margin-top:5px; margin-bottom: 20px;">Your passport is waiting for a stamp.</p>
                <button class="btn" onclick="navigateTo('#packages')">Explore Packages</button>
            </div>
        `;
    }

    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">My Bookings</h2>
            <div class="small muted">Showing ${travelerBookings.length} records</div>
        </div>
        ${travelerBookings.map(b => `
            <div class="booking-card ${b.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled'}" style="margin-bottom:20px;">
                <div class="booking-status-strip"></div>
                <div class="booking-content">
                    <div class="booking-header">
                        <div>
                            <h3 style="margin:0; color:var(--accent);">${b.packageTitle}</h3>
                            <span style="font-size:0.8rem; color:#64748b;">Booking ID: #${b.id}</span>
                        </div>
                        <div style="text-align:right;">
                            <span class="badge ${b.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled'}">
                                ${b.status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div class="booking-detail-row">
                        <span><span class="icon">📅</span> ${b.date}</span>
                        <span><span class="icon">👥</span> ${b.seats} Person(s)</span>
                    </div>
                    <div class="booking-detail-row">
                        <span><span class="icon">💳</span> ${b.paymentMethod}</span>
                        <span style="font-weight:700; color:#333;">$${b.totalPrice}</span>
                    </div>
                    
                    <div class="booking-actions">
                         ${b.status === 'confirmed' ? `
                            <button class="btn secondary small-btn" onclick="showToast('Ticket PDF downloading...')">
                                <i class="fa-solid fa-download"></i> Ticket
                            </button>
                            <button class="btn secondary small-btn" style="color:#dc3545; border-color:#fee2e2; background:#fff5f5;" onclick="cancelBooking('${b.id}')">
                                Cancel Booking
                            </button>
                         ` : `
                            <button class="btn secondary small-btn" disabled style="opacity:0.5;">Cancelled</button>
                         `}
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

// 3. Wishlist Tab
function getWishlistView(wishlistCount) {
    // Filter Saved Packages AND Saved Destinations
    const savedPkgs = state.packages.filter(p => state.wishlist.includes(p.id));
    const savedDests = state.destinations.filter(d => state.wishlist.includes(d.id));
    
    const isEmpty = savedPkgs.length === 0 && savedDests.length === 0;

    if (isEmpty) {
        return `
            <h2 style="margin-top:0;">Saved Items</h2>
            <div class="empty-state-card">
                <i class="fa-solid fa-heart" style="font-size: 3rem; color: #fca5a5; margin-bottom: 15px;"></i>
                <h3 style="margin:0; color: #4b5563;">Your wishlist is empty</h3>
                <p class="small muted" style="margin-top:5px; margin-bottom: 20px;">Save packages or destinations to view them here.</p>
                <button class="btn" onclick="navigateTo('#destinations')">Start Exploring</button>
            </div>`;
    }

    return `
        <h2 style="margin-top:0;">My Wishlist</h2>
        
        ${savedDests.length > 0 ? `
            <h3 style="font-size:1.1rem; color:#64748b; margin-bottom:15px;">Destinations (${savedDests.length})</h3>
            <div class="grid cols-3" style="gap:20px; margin-bottom:30px;">
                ${savedDests.map(d => `
                    <div class="card" style="padding:0; position:relative; overflow:hidden;">
                        <img src="${d.image}" style="width:100%; height:150px; object-fit:cover;">
                        <button onclick="toggleWishlist('${d.id}'); renderTravelerDashboard();" style="position:absolute; top:10px; right:10px; border:none; background:#fff; border-radius:50%; width:30px; height:30px; cursor:pointer; color:#dc3545; display:flex; align-items:center; justify-content:center;">✕</button>
                        <div style="padding:15px;">
                            <h4 style="margin:0 0 5px 0;">${d.name}</h4>
                            <p class="small muted" style="margin:0 0 10px 0;">${d.province}</p>
                            <button class="btn secondary small-btn" style="width:100%;" onclick="openPackagesByDest('${d.id}')">View Packages</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}

        ${savedPkgs.length > 0 ? `
            <h3 style="font-size:1.1rem; color:#64748b; margin-bottom:15px;">Tour Packages (${savedPkgs.length})</h3>
            <div class="grid cols-3" style="gap:20px;">
                ${savedPkgs.map(p => `
                <div class="card" style="padding:0; position:relative; display:flex; flex-direction:column; overflow:hidden;">
                    <div style="position:relative; height:150px;">
                        <img src="${state.destinations.find(d=>d.id===p.destId).image}" style="width:100%; height:100%; object-fit:cover;">
                        <button onclick="toggleWishlist(${p.id}); renderTravelerDashboard();" style="position:absolute; top:10px; right:10px; border:none; background:#fff; border-radius:50%; width:30px; height:30px; cursor:pointer; color:#dc3545; display:flex; align-items:center; justify-content:center;">✕</button>
                    </div>
                    <div style="padding:15px; flex:1; display:flex; flex-direction:column;">
                        <h4 style="margin:0 0 5px 0;">${p.title}</h4>
                        <div class="small muted" style="margin-bottom:15px;">$${p.price} / person</div>
                        <button class="btn small-btn" style="width:100%; margin-top:auto;" onclick="navigateTo('#booking-${p.id}')">Book Now</button>
                    </div>
                </div>`).join('')}
            </div>
        ` : ''}
    `;
}
// 4. Settings Tab
/* --- PROFESSIONAL SETTINGS VIEW --- */
function getSettingsView() {
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0;">Account Settings</h2>
            <span class="badge" style="background:#e0f2fe; color:#0369a1; padding:5px 10px;">ID: ${state.user.id}</span>
        </div>
        
        <div class="settings-section">
            <h3 class="settings-title">Personal Profile</h3>
            <span class="settings-subtitle">Manage your public profile and contact details.</span>
            
            <div class="settings-profile-header">
                <img src="${state.user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}" class="settings-avatar">
                <div>
                    <label class="settings-upload-btn">
                        <i class="fa-solid fa-camera"></i> Change Avatar
                        <input type="file" id="settingsProfileUpload" accept="image/*" onchange="handleProfileUpload(event)">
                    </label>
                    <p class="small muted" style="margin:5px 0 0 0;">Allowed: JPG, PNG. Max 2MB.</p>
                </div>
            </div>

            <form onsubmit="event.preventDefault(); updateProfile()">
                <div class="row" style="margin-bottom:15px;">
                    <div style="flex:1">
                        <label>Display Name</label>
                        <input id="profileName" value="${state.user.name}" style="width:100%;" />
                    </div>
                    <div style="flex:1">
                        <label>Phone Number</label>
                        <input id="profilePhone" value="${state.user.phone || ''}" placeholder="+63 900 000 0000" style="width:100%;" />
                    </div>
                </div>
                <div style="margin-bottom:15px;">
                    <label>Email Address</label>
                    <input id="profileEmail" value="${state.user.email}" style="width:100%; background:#f8fafc; color:#64748b;" readonly title="Contact support to change email" />
                </div>
                <div style="margin-bottom:15px;">
                    <label>Bio / About Me</label>
                    <textarea id="profileBio" rows="3" style="width:100%;">${state.user.bio || ''}</textarea>
                </div>
                <button class="btn" type="submit">Save Profile Changes</button>
            </form>
        </div>

        <div class="settings-section">
            <h3 class="settings-title">Travel Preferences</h3>
            <span class="settings-subtitle">Customize your booking experience automatically.</span>
            
            <div class="pref-grid">
                <div>
                    <label>Passport / ID Number</label>
                    <input type="text" placeholder="Encrypted" style="width:100%;" value="${state.user.passport || ''}">
                </div>
                <div>
                    <label>Nationality</label>
                    <select style="width:100%;">
                        <option>Filipino</option>
                        <option>American</option>
                        <option>Japanese</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label>Seat Preference</label>
                    <select style="width:100%;">
                        <option>No Preference</option>
                        <option>Window Seat</option>
                        <option>Aisle Seat</option>
                    </select>
                </div>
                <div>
                    <label>Dietary Restrictions</label>
                    <select style="width:100%;">
                        <option>None</option>
                        <option>Vegetarian</option>
                        <option>Vegan</option>
                        <option>Halal</option>
                    </select>
                </div>
            </div>
            <button class="btn secondary" onclick="showToast('Preferences updated!')">Update Preferences</button>
        </div>

        <div class="settings-section">
            <h3 class="settings-title">Security & Login</h3>
            
            <div class="row" style="margin-bottom:20px;">
                <div style="flex:1">
                    <label>Current Password</label>
                    <input type="password" placeholder="••••••••" style="width:100%;">
                </div>
                <div style="flex:1">
                    <label>New Password</label>
                    <input type="password" placeholder="New password" style="width:100%;">
                </div>
                <div style="display:flex; align-items:end;">
                    <button class="btn secondary" onclick="showToast('Password changed successfully!', 'success')">Update</button>
                </div>
            </div>

            <h4 style="margin-bottom:10px; color:#334155;">Active Sessions</h4>
            <div class="session-list">
                <div class="session-item">
                    <div style="display:flex; align-items:center;">
                        <i class="fa-solid fa-desktop session-icon"></i>
                        <div class="session-info">
                            <h4>Windows PC - Chrome</h4>
                            <p>Quezon City, PH • Just now</p>
                        </div>
                    </div>
                    <span class="session-status">Active</span>
                </div>
                <div class="session-item">
                    <div style="display:flex; align-items:center;">
                        <i class="fa-solid fa-mobile-screen-button session-icon"></i>
                        <div class="session-info">
                            <h4>iPhone 13 - Safari</h4>
                            <p>Makati, PH • 2 days ago</p>
                        </div>
                    </div>
                    <button class="text-btn" onclick="showToast('Session revoked')">Log Out</button>
                </div>
            </div>
        </div>

        <div class="settings-section">
            <h3 class="settings-title">Payment Methods</h3>
            <span class="settings-subtitle">Manage your saved cards for faster checkout.</span>
            
            <div class="saved-cards-grid">
                <div class="credit-card-visual" id="card-1">
                    <button class="cc-delete-btn" onclick="document.getElementById('card-1').remove(); showToast('Card removed')"><i class="fa-solid fa-trash"></i></button>
                    <div class="cc-chip"></div>
                    <div class="cc-number">•••• •••• •••• 4242</div>
                    <div class="cc-info">
                        <span>${state.user.name.toUpperCase()}</span>
                        <span>12/28</span>
                    </div>
                </div>
                <div class="add-card-btn" onclick="showToast('Redirecting to secure gateway...')">
                    <i class="fa-solid fa-plus-circle" style="font-size:2rem; margin-bottom:10px;"></i>
                    <span>Add New Card</span>
                </div>
            </div>
        </div>

        <div class="danger-zone">
            <h3 class="danger-title">Danger Zone</h3>
            <span class="danger-desc">Once you delete your account, there is no going back. Please be certain.</span>
            <button class="btn" style="background:#dc3545; border:none;" onclick="handleDeleteAccount()">Delete Account</button>
        </div>
    `;
}

// 5. Support Tab (New)
function getSupportView() {
    return `
        <div class="support-hero">
            <h2 style="margin:0; color:white;">How can we help you?</h2>
            <p style="opacity:0.9;">Browse our FAQs or contact our dedicated travel concierge.</p>
        </div>

        <div class="grid" style="grid-template-columns: 1fr 1fr; gap:30px;">
            <div>
                <h3 style="margin-top:0;">Frequently Asked Questions</h3>
                
                <div class="faq-item">
                    <button class="faq-trigger" onclick="toggleFaq(this)">
                        How do I cancel a booking? <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="faq-content">
                        Go to the "My Bookings" tab, find the trip you wish to cancel, and click the "Cancel Booking" button. Refunds are processed within 5-7 business days.
                    </div>
                </div>

                <div class="faq-item">
                    <button class="faq-trigger" onclick="toggleFaq(this)">
                        Can I change my travel dates? <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="faq-content">
                        Yes, date changes are allowed up to 48 hours before the trip, subject to seat availability. Please contact support to reschedule.
                    </div>
                </div>

                <div class="faq-item">
                    <button class="faq-trigger" onclick="toggleFaq(this)">
                        What payment methods are accepted? <i class="fa-solid fa-chevron-down"></i>
                    </button>
                    <div class="faq-content">
                        We accept all major Credit/Debit cards (Visa, Mastercard), as well as local e-wallets like GCash and PayMaya.
                    </div>
                </div>
            </div>

            <div class="settings-section" style="margin:0;">
                <h3 class="settings-title">Contact Us</h3>
                <span class="settings-subtitle">We typically reply within 2 hours.</span>
                <form onsubmit="event.preventDefault(); showToast('Message sent! Ticket #9923 created.')">
                    <label>Subject</label>
                    <select style="width:100%; margin-bottom:10px;">
                        <option>Booking Inquiry</option>
                        <option>Payment Issue</option>
                        <option>Feedback</option>
                        <option>Other</option>
                    </select>
                    
                    <label>Message</label>
                    <textarea rows="5" placeholder="Describe your issue..." required style="width:100%; margin-bottom:15px;"></textarea>
                    
                    <button class="btn" style="width:100%;">Send Message</button>
                </form>
            </div>
        </div>
    `;
}

/* --- PASSWORD RECOVERY LOGIC --- */

let recoveryState = {
    email: '',
    code: null,
    step: 1
};

function openRecoveryModal() {
    // Close other modals first
    closeSignInModal(); 
    closeSignUpModal();
    
    document.getElementById('forgotPasswordModal').style.display = 'flex';
    renderRecoveryStep1();
}

function closeRecoveryModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    recoveryState = { email: '', code: null, step: 1 }; // Reset
}

// STEP 1: Input Email
function renderRecoveryStep1() {
    const container = document.getElementById('recoveryStepContainer');
    container.innerHTML = `
        <div class="auth-header">
            <h3 class="auth-title">Reset Password</h3>
            <p class="auth-subtitle">Enter your email to receive a verification code.</p>
        </div>
        <form onsubmit="event.preventDefault(); sendRecoveryCode()">
            <div class="input-group">
                <i class="fa-solid fa-envelope input-icon"></i>
                <input id="recEmail" type="email" placeholder="Email Address" required />
            </div>
            <button class="btn" type="submit" style="width:100%; padding:12px;">Send Code</button>
        </form>
        <div class="auth-footer">
            Remembered it? 
            <span class="link-accent" onclick="closeRecoveryModal(); openSignInModal();">Back to Login</span>
        </div>
    `;
}

// Logic: Send Mock Code
function sendRecoveryCode() {
    const email = document.getElementById('recEmail').value;
    if(!email) return;

    recoveryState.email = email;
    // Generate random 6 digit code
    recoveryState.code = Math.floor(100000 + Math.random() * 900000);
    
    showToast(`Code sent to ${email}: ${recoveryState.code}`); // Mock email send
    renderRecoveryStep2();
}

// STEP 2: Verify Code
function renderRecoveryStep2() {
    const container = document.getElementById('recoveryStepContainer');
    container.innerHTML = `
        <div class="auth-header">
            <h3 class="auth-title">Verify It's You</h3>
            <p class="auth-subtitle">Enter the 6-digit code sent to <strong>${recoveryState.email}</strong>.</p>
        </div>
        <form onsubmit="event.preventDefault(); verifyRecoveryCode()">
            <div class="input-group">
                <i class="fa-solid fa-shield-halved input-icon"></i>
                <input id="recCode" type="number" placeholder="000000" style="letter-spacing: 5px; font-weight: 700;" required />
            </div>
            <button class="btn" type="submit" style="width:100%; padding:12px;">Verify Code</button>
        </form>
        <div class="auth-footer">
            Didn't receive it? 
            <span class="link-accent" onclick="showToast('Code resent!')">Resend</span>
            <br><br>
            <span class="link-accent" style="font-size:0.85rem; color:#64748b;" onclick="renderRecoveryStep1()">Change Email</span>
        </div>
    `;
}

// Logic: Verify Code
function verifyRecoveryCode() {
    const inputCode = document.getElementById('recCode').value;
    
    if(parseInt(inputCode) === recoveryState.code) {
        renderRecoveryStep3();
    } else {
        showToast("Invalid code. Please try again.", "error");
    }
}

// STEP 3: Set New Password
function renderRecoveryStep3() {
    const container = document.getElementById('recoveryStepContainer');
    container.innerHTML = `
        <div class="auth-header">
            <h3 class="auth-title">New Password</h3>
            <p class="auth-subtitle">Create a secure password for your account.</p>
        </div>
        <form onsubmit="event.preventDefault(); finalizePasswordReset()">
            <div class="input-group">
                <i class="fa-solid fa-lock input-icon"></i>
                <input id="newPass" type="password" placeholder="New Password" required />
            </div>
            <div class="input-group">
                <i class="fa-solid fa-check-double input-icon"></i>
                <input id="confPass" type="password" placeholder="Confirm Password" required />
            </div>
            <button class="btn" type="submit" style="width:100%; padding:12px;">Reset Password</button>
        </form>
    `;
}

// Logic: Reset and Success
function finalizePasswordReset() {
    const p1 = document.getElementById('newPass').value;
    const p2 = document.getElementById('confPass').value;

    if(p1 !== p2) {
        showToast("Passwords do not match", "error");
        return;
    }

    if(p1.length < 6) {
        showToast("Password must be at least 6 characters", "error");
        return;
    }

    // Success View
    const container = document.getElementById('recoveryStepContainer');
    container.innerHTML = `
        <div style="text-align:center; padding: 20px 0;">
            <div style="width:60px; height:60px; background:#d1e7dd; color:#0f5132; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 20px;">
                <i class="fa-solid fa-check"></i>
            </div>
            <h3 class="auth-title">Password Reset!</h3>
            <p class="auth-subtitle" style="margin-bottom:20px;">Your password has been updated successfully. You can now log in.</p>
            <button class="btn" onclick="closeRecoveryModal(); openSignInModal()" style="width:100%;">Return to Log In</button>
        </div>
    `;
}

/* --- PASSWORD TOGGLE FUNCTION --- */
function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    
    if (input.type === "password") {
        // Switch to text
        input.type = "text";
        
        // Switch icon to "slashed eye"
        iconElement.classList.remove("fa-eye");
        iconElement.classList.add("fa-eye-slash");
        iconElement.style.color = "var(--accent)"; // Optional: highlight color
    } else {
        // Switch back to password
        input.type = "password";
        
        // Switch icon back to "eye"
        iconElement.classList.remove("fa-eye-slash");
        iconElement.classList.add("fa-eye");
        iconElement.style.color = ""; // Reset color
    }
}

/* --- HANDLE WISHLIST CLICK (Gatekeeper) --- */
function handleDestinationWishlist(btnElement, destId) {
    // 1. Check if user is logged in
    if (!state.user) {
        showToast("Please log in to save items to your wishlist.", "error");
        openSignInModal();
        return; // STOP HERE! Do not toggle the class.
    }

    // 2. If logged in, proceed with logic
    toggleWishlist(destId);
    
    // 3. visually toggle the heart immediately for instant feedback
    btnElement.classList.toggle('active');
    
    // 4. Add a cool "pop" animation effect
    if(btnElement.classList.contains('active')) {
        btnElement.style.animation = 'none';
        btnElement.offsetHeight; /* trigger reflow */
        btnElement.style.animation = 'heartPop 0.3s ease-out';
    }
}

/* --- AI CHAT WIDGET LOGIC --- */

let isChatOpen = false;

function toggleChat() {
    const widget = document.getElementById('chat-widget');
    const badge = document.querySelector('.chat-badge');
    
    isChatOpen = !isChatOpen;
    
    if (isChatOpen) {
        widget.classList.add('active');
        if(badge) badge.style.display = 'none'; // Hide "1" notification
        
        // Auto focus input
        setTimeout(() => document.getElementById('chatInput').focus(), 300);
    } else {
        widget.classList.remove('active');
    }
}

function handleChatSubmit() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    // 1. Add User Message
    addMessage(text, 'user');
    input.value = '';
    
    // 2. Simulate AI Typing (Delay)
    showTypingIndicator();
    
    // 3. Process AI Response
    setTimeout(() => {
        removeTypingIndicator();
        const response = generateAIResponse(text);
        addMessage(response, 'bot');
        
        // Scroll to bottom
        const body = document.getElementById('chatBody');
        body.scrollTop = body.scrollHeight;
    }, 1500 + Math.random() * 1000); // Random delay between 1.5s and 2.5s
}

function addMessage(text, sender) {
    const body = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="msg-content">${text}</div>
        <div class="msg-time">${time}</div>
    `;
    
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function showTypingIndicator() {
    const body = document.getElementById('chatBody');
    const div = document.createElement('div');
    div.className = 'message bot typing-indicator-msg';
    div.id = 'typingIndicator';
    div.innerHTML = `
        <div class="msg-content">
            <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
    `;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
}

// --- MOCK AI BRAIN ---
function generateAIResponse(input) {
    const lower = input.toLowerCase();
    
    if (lower.includes('hello') || lower.includes('hi')) {
        return "Hello there! Ready to plan your next adventure in the Philippines?";
    }
    
    if (lower.includes('price') || lower.includes('cost') || lower.includes('expensive')) {
        return "Our packages range from $79 to $350 depending on the destination. You can view all details in the <b>'Destinations'</b> tab.";
    }
    
    if (lower.includes('boracay')) {
        return "Boracay is our top seller! We have a 3D/2N package for $129.99 which includes hotel and island hopping. Would you like to see it?";
    }
    
    if (lower.includes('palawan') || lower.includes('el nido')) {
        return "Palawan is beautiful! We offer tours for both Puerto Princesa ($199) and El Nido ($299).";
    }
    
    if (lower.includes('cancel') || lower.includes('refund')) {
        return "You can cancel trips via your <b>Dashboard > My Bookings</b>. Refunds are processed within 5-7 business days.";
    }

    if (lower.includes('contact') || lower.includes('support')) {
        return "You can reach our human agents at support@sofias-travel.com or call +63 917 123 4567.";
    }
    
    // Default fallback
    return "I'm not sure about that, but I can help you find destinations or check booking status. Try asking about 'Boracay' or 'Prices'.";
}

/* --- PROFESSIONAL NOTIFICATION SYSTEM LOGIC --- */

// Initialize Notification State
if (!state.notifications) {
    state.notifications = [
        // Mock Data for Demo
        { id: 1, type: 'promo', title: 'Flash Sale! 🌴', message: 'Get 20% off Boracay packages this weekend only.', time: '2 hours ago', read: false },
        { id: 2, type: 'alert', title: 'Weather Update 🌧️', message: 'Light rains expected in Palawan. Don\'t forget your umbrella!', time: '5 hours ago', read: false },
        { id: 3, type: 'system', title: 'Welcome to Sofia\'s Travel', message: 'Thanks for visiting! Complete your profile to earn points.', time: '1 day ago', read: true }
    ];
}

function renderNotifications() {
    // We must grab elements dynamically because updateAuthUI recreates them
    const list = document.getElementById('notifList');
    const badge = document.getElementById('notifBadge');
    
    // Safety check: if user is not logged in, these elements won't exist
    if (!list || !badge) return;
    
    const unreadCount = state.notifications.filter(n => !n.read).length;
    
    if (unreadCount > 0) {
        badge.style.display = 'flex';
        badge.innerText = unreadCount > 9 ? '9+' : unreadCount;
    } else {
        badge.style.display = 'none';
    }

    if (state.notifications.length === 0) {
        list.innerHTML = `
            <div class="notif-empty">
                <i class="fa-regular fa-bell-slash" style="font-size:2rem; margin-bottom:10px; opacity:0.5;"></i>
                <p>No notifications yet.</p>
            </div>`;
        return;
    }

    list.innerHTML = state.notifications.map(n => {
        let icon = 'fa-info';
        let typeClass = 'type-system';
        
        if(n.type === 'booking') { icon = 'fa-plane-circle-check'; typeClass = 'type-booking'; }
        if(n.type === 'alert') { icon = 'fa-triangle-exclamation'; typeClass = 'type-alert'; }
        if(n.type === 'promo') { icon = 'fa-tag'; typeClass = 'type-promo'; }
        if(n.type === 'system') { icon = 'fa-check-circle'; typeClass = 'type-system'; }

        return `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotificationRead(${n.id})">
            <div class="notif-icon-box ${typeClass}">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="notif-content">
                <h4>${n.title}</h4>
                <p>${n.message}</p>
                <span class="notif-time">${n.time}</span>
            </div>
        </div>
        `;
    }).join('');
}

function toggleNotifications() {
    const dropdown = document.getElementById('notifDropdown');
    const userMenu = document.getElementById('userDropdownMenu'); // Close other menu
    
    if (userMenu) userMenu.classList.remove('visible');
    
    // Toggle active class
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
        renderNotifications();
    }
}

// Close notifications when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notifDropdown');
    const btn = document.querySelector('.notif-btn');
    
    if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    }
});

function addNotification(type, title, message) {
    const newNotif = {
        id: Date.now(),
        type: type, // 'booking', 'alert', 'promo', 'system'
        title: title,
        message: message,
        time: 'Just now',
        read: false
    };
    
    // Add to start of array
    state.notifications.unshift(newNotif);
    
    // Update UI immediately
    renderNotifications();
    
    // Show a Toast as well for immediate visibility
    showToast(title, 'info');
}

function markNotificationRead(id) {
    const notif = state.notifications.find(n => n.id === id);
    if (notif) {
        notif.read = true;
        renderNotifications();
    }
}

function markAllNotificationsRead() {
    state.notifications.forEach(n => n.read = true);
    renderNotifications();
}

function clearAllNotifications() {
    state.notifications = [];
    renderNotifications();
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization ...
    renderNotifications();
});

/* --- DANGER ZONE LOGIC --- */
function handleDeleteAccount() {
    const confirmation = prompt("To confirm deletion, please type 'DELETE' below:");
    
    if (confirmation === 'DELETE') {
        // 1. Clear user state
        state.user = null;
        
        // 2. Clear notifications and history (Mock)
        state.bookings = [];
        state.notifications = [];
        
        // 3. UI Updates
        updateAuthUI();
        showToast("Account deleted successfully.", "error");
        
        // 4. Redirect home
        navigateTo('#home');
    } else if (confirmation !== null) {
        showToast("Incorrect confirmation text. Deletion cancelled.", "error");
    }
}

// Update the existing profile update function to handle the new fields
function updateProfile() {
    const newName = document.getElementById('profileName').value;
    const newPhone = document.getElementById('profilePhone').value;
    const newBio = document.getElementById('profileBio').value;

    if(state.user) {
        state.user.name = newName;
        state.user.phone = newPhone;
        state.user.bio = newBio;
        // In a real app, you would save Passport/Preferences here too
        
        // Refresh UI
        updateAuthUI();
        showToast("Profile updated successfully!", "success");
    }
}

/* --- SEARCH LOGIC --- */
/* --- SEARCH LOGIC & AUTOCOMPLETE --- */
let selectedSearchDestId = null;

/* --- ADVANCED SEARCH (With Keyboard Support) --- */
function setupSearchAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let dropdown = document.getElementById('searchResultsDropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'searchResultsDropdown';
        dropdown.className = 'search-results-dropdown';
        input.parentNode.appendChild(dropdown); 
        input.parentNode.style.position = 'relative'; 
    }

    input.addEventListener('input', function(e) {
        const val = e.target.value.toLowerCase().trim();
        selectedSearchDestId = null; 

        if (val.length < 1) {
            dropdown.style.display = 'none';
            return;
        }

        const matches = state.destinations.filter(d => 
            d.name.toLowerCase().includes(val) || 
            d.province.toLowerCase().includes(val)
        );

        if (matches.length > 0) {
            dropdown.innerHTML = matches.map((d, index) => `
                <div class="search-result-item" 
                     onmousedown="selectSearchDest('${d.id}', '${d.name}', '${inputId}')">
                    
                    <img src="${d.image}" class="result-thumb">
                    
                    <div class="result-info">
                        <h4>${d.name}</h4>
                        <span>${d.province}</span>
                    </div>
                </div>
            `).join('');
            dropdown.style.display = 'block';
        } else {
            dropdown.innerHTML = `<div style="padding:15px; color:#94a3b8; text-align:center;">No destinations found</div>`;
            dropdown.style.display = 'block';
        }
    });

    // Hide when clicking elsewhere
    document.addEventListener('mousedown', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    // Hide on Tab/Enter key press (Accessibility)
    input.addEventListener('keydown', function(e){
        if(e.key === 'Tab' || e.key === 'Enter') {
            dropdown.style.display = 'none';
        }
    });
}
window.selectSearchDest = function(id, name, inputId) {
    const input = document.getElementById(inputId);
    input.value = name;
    selectedSearchDestId = id;
    
    // Hide dropdown immediately
    const dropdown = document.getElementById('searchResultsDropdown');
    if(dropdown) dropdown.style.display = 'none';
    
    // Optional: Auto-focus the search button or next field
    showToast(`Selected: ${name}`);
}

function handleHomeSearch() {
    const input = document.getElementById('heroDestInput');
    const textVal = input.value.trim();

    if (selectedSearchDestId) {
        // Case 1: User clicked an autocomplete item
        showToast(`Searching packages for ${textVal}...`);
        openPackagesByDest(selectedSearchDestId);
    
    } else if (textVal) {
        // Case 2: User typed "Boracay" but didn't click the dropdown
        // We try to fuzzy match it ourselves
        const match = state.destinations.find(d => d.name.toLowerCase() === textVal.toLowerCase());
        
        if (match) {
            openPackagesByDest(match.id);
        } else {
            // Case 3: Random text (Search all packages)
            showToast(`Searching all packages for "${textVal}"...`);
            // Here you could implement a text filter for packages, 
            // but for now we redirect to all packages
            navigateTo('#packages');
        }
    } else {
        showToast("Please enter a destination.", "error");
        input.focus();
    }
}

/* --- MOBILE MENU LOGIC --- */

// Toggle function attached to the hamburger button
function toggleMobileMenu() {
    const nav = document.getElementById('mainNav');
    nav.classList.toggle('active');
}

// Auto-close menu when a link is clicked
document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
        const nav = document.getElementById('mainNav');
        if (nav.classList.contains('active')) {
            nav.classList.remove('active');
        }
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.getElementById('mainNav');
    const btn = document.querySelector('.mobile-menu-btn');
    
    // If menu is open, and click is NOT on the menu or the button
    if (nav.classList.contains('active') && !nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('active');
    }
});

/* --- FIX: Close Map with ESC Key --- */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const mapOverlay = document.getElementById('mapModalOverlay');
        
        // Only close if the map is currently visible
        if (mapOverlay && mapOverlay.style.display === 'flex') {
            closeMapModal();
        }
    }
});

/* --- PROFESSIONAL REVIEW SYSTEM --- */

let currentReviewRating = 0;

function openReviewModal(destId) {
    const dest = state.destinations.find(d => d.id === destId);
    if (!dest) return;

    // Get existing comments or empty array
    const comments = state.comments[destId] || [];
    
    // Sort by newest first (mock date logic or just reverse)
    const sortedComments = [...comments].reverse();

    const modalContent = document.querySelector('#reviewModalOverlay .modal-content');
    
    modalContent.innerHTML = `
        <div class="review-header">
            <div>
                <h3 style="margin:0; font-size:1.1rem;">${dest.name} Reviews</h3>
                <div style="font-size:0.85rem; color:#64748b;">${dest.rating} <i class="fa-solid fa-star" style="color:#f59e0b;"></i> based on ${comments.length + 50} reviews</div>
            </div>
            <button onclick="closeReviewModal()" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer;">&times;</button>
        </div>

        <div class="review-list">
            ${sortedComments.length > 0 ? sortedComments.map(c => `
                <div class="review-item">
                    <div class="review-user">
                        <span>${c.user}</span>
                        <div class="review-stars">
                            ${Array(5).fill(0).map((_,i) => `<i class="fa-solid fa-star" style="color:${i < (c.rating || 5) ? '#f59e0b' : '#e2e8f0'}"></i>`).join('')}
                        </div>
                    </div>
                    <div class="review-text">${c.text}</div>
                    <span class="review-date">${c.date}</span>
                </div>
            `).join('') : `
                <div style="text-align:center; padding:40px; color:#94a3b8;">
                    <i class="fa-regular fa-comment-dots" style="font-size:2rem; margin-bottom:10px;"></i>
                    <p>No reviews yet. Be the first!</p>
                </div>
            `}
        </div>

        <div class="review-form-container">
            <div class="star-input" id="starInputWidget">
                ${[1,2,3,4,5].map(n => `<i class="fa-solid fa-star" onclick="setReviewRating(${n})" onmouseover="hoverReviewRating(${n})" onmouseout="resetReviewRating()"></i>`).join('')}
            </div>
            <div style="display:flex; gap:10px;">
                <input id="newReviewText" placeholder="Share your experience..." style="flex:1; border:1px solid #e2e8f0; border-radius:20px; padding:10px 15px; outline:none;">
                <button class="btn" style="border-radius:50px; padding:8px 20px;" onclick="submitReview('${destId}')">Post</button>
            </div>
        </div>
    `;

    document.getElementById('reviewModalOverlay').style.display = 'flex';
    currentReviewRating = 0; // Reset
}

function closeReviewModal(e) {
    if (!e || e.target.id === 'reviewModalOverlay' || e.target.closest('button')) {
        document.getElementById('reviewModalOverlay').style.display = 'none';
    }
}

// Star Rating Logic
function setReviewRating(n) {
    currentReviewRating = n;
    updateStars(n);
}
function hoverReviewRating(n) {
    updateStars(n);
}
function resetReviewRating() {
    updateStars(currentReviewRating);
}
function updateStars(n) {
    const stars = document.querySelectorAll('#starInputWidget i');
    stars.forEach((star, index) => {
        if (index < n) star.classList.add('active');
        else star.classList.remove('active');
    });
}

function submitReview(destId) {
    // 1. Auth Check
    if (!state.user) {
        showToast("Please log in to post a review.", "error");
        return;
    }

    // 2. Validation
    const text = document.getElementById('newReviewText').value.trim();
    if (!text) {
        showToast("Please write a comment.", "error");
        return;
    }
    if (currentReviewRating === 0) {
        showToast("Please select a star rating.", "error");
        return;
    }

    // 3. Save Data
    if (!state.comments[destId]) state.comments[destId] = [];
    
    state.comments[destId].push({
        user: state.user.name,
        text: text,
        rating: currentReviewRating,
        date: 'Just now'
    });

    // 4. Success UI
    showToast("Review posted successfully!", "success");
    openReviewModal(destId); // Refresh modal to show new comment
    
    // Optional: Update global rating (Mock logic)
    const dest = state.destinations.find(d => d.id === destId);
    if(dest) {
        // Simple average calculation update
        // In real app, this is backend logic
    }
}

/* --- LIVE FILTER HELPER (With Empty State Logic) --- */
function filterPageItems(query, selector) {
    const term = query.toLowerCase().trim();
    const items = document.querySelectorAll(selector);
    let visibleCount = 0;

    // 1. Loop through items to Hide/Show
    items.forEach(item => {
        const keywords = item.getAttribute('data-search-term');
        
        if (keywords && keywords.includes(term)) {
            item.style.display = 'flex'; // Show match
            visibleCount++;
        } else {
            item.style.display = 'none'; // Hide mismatch
        }
    });

    // 2. Handle "No Results" Message
    const container = document.querySelector('.grid'); // The parent grid container
    let emptyState = document.getElementById('no-search-results');

    if (visibleCount === 0) {
        // If message doesn't exist yet, create it
        if (!emptyState && container) {
            emptyState = document.createElement('div');
            emptyState.id = 'no-search-results';
            
            // Style it to span the whole grid
            emptyState.style.gridColumn = '1 / -1'; 
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '60px 20px';
            emptyState.style.color = '#64748b';
            emptyState.style.animation = 'fadeIn 0.3s ease';
            
            container.appendChild(emptyState);
        }
        
        // Update the text
        if (emptyState) {
            emptyState.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 10px; opacity: 0.5;">🔍</div>
                <h3 style="margin:0; color:#334155;">No results found</h3>
                <p style="margin:5px 0 0 0;">We couldn't find anything matching "<strong>${term}</strong>".</p>
                <button class="text-btn" style="margin-top:15px; color:var(--accent); font-weight:700;" onclick="clearPageSearch()">Clear Search</button>
            `;
            emptyState.style.display = 'block';
        }
        
    } else {
        // Results found, hide the message
        if (emptyState) emptyState.style.display = 'none';
    }
}

// Helper to clear the search input when user clicks "Clear Search"
function clearPageSearch() {
    const input = document.querySelector('.page-search-input');
    if(input) {
        input.value = '';
        // Trigger the filter again with empty string to show all
        const selector = location.hash === '#destinations' ? '.card.destination' : '.pkg-card';
        filterPageItems('', selector);
        input.focus();
    }
}

/* --- NEWSLETTER LOGIC --- */
function handleSubscribe(event) {
    event.preventDefault(); // Stop the page from reloading
    
    const form = event.target;
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();

    // Simple Validation
    if(email && email.includes('@') && email.includes('.')) {
        // Success State
        showToast(`Success! ${email} has been subscribed.`, 'success');
        
        // Visual Feedback (Change button text temporarily)
        const btn = form.querySelector('button');
        const originalText = btn.innerText;
        btn.innerText = 'Subscribed! ✓';
        btn.style.background = '#10b981'; // Green
        
        // Reset Form
        form.reset();
        
        // Revert button after 2 seconds
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = '#fcd34d'; // Back to Yellow
        }, 3000);
        
    } else {
        // Error State
        showToast('Please enter a valid email address.', 'error');
        input.focus();
    }
}

/* --- OPERATOR PACKAGE MANAGEMENT LOGIC --- */

function openAddPackageModal() {
    // Check if modal already exists in DOM, if not create it
    let modal = document.getElementById('addPackageModal');
    
    if (!modal) {
        const modalHtml = `
        <div id="addPackageModal" class="modal-overlay" onclick="if(event.target === this) closeAddPackageModal()">
            <div class="modal-content" style="width:500px; max-width:95%;">
                <button class="modal-close-btn" onclick="closeAddPackageModal()">×</button>
                
                <div class="auth-header" style="margin-bottom:20px;">
                    <h3 class="auth-title">Create New Package</h3>
                    <p class="auth-subtitle">Add a new tour to your listings.</p>
                </div>
                
                <form onsubmit="event.preventDefault(); handleAddPackage()">
                    <div style="margin-bottom:15px;">
                        <label style="font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:5px; display:block;">Package Title</label>
                        <input id="newPkgTitle" placeholder="e.g. Ultimate Island Hopping" required 
                               style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>

                    <div class="row" style="margin-bottom:15px;">
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:5px; display:block;">Destination</label>
                            <select id="newPkgDest" style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; background:white;">
                                ${state.destinations.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:5px; display:block;">Type</label>
                            <select id="newPkgType" style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; background:white;">
                                <option value="leisure">Leisure</option>
                                <option value="adventure">Adventure</option>
                                <option value="culture">Culture</option>
                            </select>
                        </div>
                    </div>

                    <div class="row" style="margin-bottom:15px;">
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:5px; display:block;">Price (PHP)</label>
                            <input id="newPkgPrice" type="number" min="1" placeholder="0.00" required 
                                   style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div style="flex:1;">
                            <label style="font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:5px; display:block;">Seats</label>
                            <input id="newPkgSeats" type="number" min="1" value="10" required 
                                   style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>

                    <div style="margin-bottom:20px;">
                        <label style="font-size:0.85rem; font-weight:700; color:#334155; margin-bottom:5px; display:block;">Description</label>
                        <textarea id="newPkgDesc" rows="3" placeholder="Describe the itinerary..." required 
                                  style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; font-family:inherit;"></textarea>
                    </div>

                    <button class="btn" type="submit" style="width:100%;">Create Package</button>
                </form>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        modal = document.getElementById('addPackageModal');
    }
    
    // Reset form fields
    document.getElementById('newPkgTitle').value = '';
    document.getElementById('newPkgPrice').value = '';
    document.getElementById('newPkgDesc').value = '';
    
    modal.style.display = 'flex';
}

function closeAddPackageModal() {
    const modal = document.getElementById('addPackageModal');
    if(modal) modal.style.display = 'none';
}

function handleAddPackage() {
    // 1. Get Values
    const title = document.getElementById('newPkgTitle').value;
    const destId = document.getElementById('newPkgDest').value;
    const type = document.getElementById('newPkgType').value;
    const price = parseFloat(document.getElementById('newPkgPrice').value);
    const seats = parseInt(document.getElementById('newPkgSeats').value);
    const desc = document.getElementById('newPkgDesc').value;

    // 2. Validate
    if (!title || !price || !desc) {
        showToast("Please fill in all fields.", "error");
        return;
    }

    // 3. Create Package Object
    const newPkg = {
        id: Date.now(), // Generate unique ID
        title: title,
        destId: destId,
        price: price, // Store in Base PHP
        type: type,
        seats: seats,
        description: desc
    };

    // 4. Save to State
    state.packages.unshift(newPkg); // Add to the top of the list

    // 5. Update UI
    showToast('Package created successfully!', 'success');
    closeAddPackageModal();
    
    // Refresh the dashboard to see the new card
    renderOperatorDashboard();
}

function deletePackage(id) {
    if(confirm('Are you sure you want to delete this package? This action cannot be undone.')) {
        // Remove from state
        state.packages = state.packages.filter(p => p.id !== id);
        
        showToast('Package deleted successfully.');
        
        // Refresh dashboard
        renderOperatorDashboard();
    }
}
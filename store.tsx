import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Destination, Package, Booking, Comment, ItineraryItem } from './types';

// --- Mock Data ---
const GALLERY_IMAGES: Record<string, string[]> = {
  'BOR': ['https://tripwis.com/wp-content/uploads/2023/01/sunset-in-boracay.jpg', 'https://tripwis.com/wp-content/uploads/2023/01/Boracays-nightlife.jpg', 'https://tripwis.com/wp-content/uploads/2023/01/Coast-village.jpg'],
  'PPC': ['https://thehappytrip.com/wp-content/uploads/2018/08/1024px-Puerto_Princesa_Subterranean_River_National_park_01.jpg', 'https://d2lwt6tidfiof0.cloudfront.net/images/background/bg-philippines.jpg'],
  'CHH': ['https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Chocolate_Hills_Bohol.JPG/1200px-Chocolate_Hills_Bohol.JPG', 'https://www.tripsavvy.com/thmb/Jzabkhf4XiCWze_Kqaf5rFdr8vc=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/hot_air_balloon-57c2ae8360904730a774c49d2dbf70dd.jpg'],
  'VIG': ['https://www.awanderfulsole.com/wp-content/uploads/2016/12/tumblr_n90a64f1l01rs8bs1o4_128.jpg', 'https://content.skyscnr.com/m/6fc842816afc371b/original/GettyImages-539019147.jpg?resize=1224%3Aauto'],
  'TAG': ['https://www.thepoortraveler.net/wp-content/uploads/2020/12/Peoples-Park-in-the-Sky.jpg', 'https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/07/01/6b27056fe46f55c63017b97e8c02bb81_1000x1000.jpg'],
  'ELN': ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/cb/a6/63/re-discovering-my-fave.jpg?w=1200&h=700&s=1', 'https://www.travel-palawan.com/wp-content/uploads/2018/02/Limeston-rocks-Bacuit-bay-El-Nidou-jpg-768x512.jpg'],
  'CEB': ['https://i0.wp.com/zimminaroundtheworld.com/wp-content/uploads/2024/08/DSC_5490.jpg?resize=1024%2C683&ssl=1', 'https://www.jonnymelon.com/wp-content/uploads/2019/09/kawasan-falls-canyoneering-24.jpg'],
  'SGO': ['https://thefroggyadventures.com/wp-content/uploads/2024/10/maasin-river-siargao.jpg', 'https://www.jonnymelon.com/wp-content/uploads/2018/10/guyam-island-8.jpg'],
  'BTN': ['https://ik.imagekit.io/tvlk/blog/2018/09/Valugan-Boulder-Beach-Batanes.jpg?tr=q-70,c-at_max,w-1000,h-600', 'https://ik.imagekit.io/tvlk/blog/2018/09/Basco-Lighthouse-Batanes.jpg?tr=q-70,c-at_max,w-1000,h-600'],
  'CMG': ['https://philippinetravels.ph/wp-content/uploads/2022/08/02-Camiguin-Tourist-Spots-Sto-Nino-Cold-Spring-1024x576.jpg', 'https://philippinetravels.ph/wp-content/uploads/2022/08/08-Camiguin-Tourist-Spots-Other-Side-of-Mantigue-1024x576.jpg'],
  'BGU': ['https://www.thepoortraveler.net/wp-content/uploads/2021/01/Igorot-Stone-Kingdom.jpg', 'https://www.thepoortraveler.net/wp-content/uploads/2014/01/Camp-John-Hay-Table-Rental.jpg'],
  'DMG': ['https://www.jonnymelon.com/wp-content/uploads/2018/10/dumaguete-tourist-spots-2.jpg', 'https://www.jonnymelon.com/wp-content/uploads/2018/10/dumaguete-tourist-spots-15.jpg'],
};

const DESTINATIONS: Destination[] = [
  { id:'CEB', name:'Cebu City', province:'Cebu', summary:'Historic landmarks, whale watching, and vibrant city life.', rating:4.7, image:'https://media.digitalnomads.world/wp-content/uploads/2021/08/20115612/cebu-digital-nomads.jpg' },
  { id:'SGO', name:'Siargao', province:'Surigao del Norte', summary:'Surfing capital, lagoons, white sand islands, and rock pools.', rating:4.8, image:'https://images.squarespace-cdn.com/content/v1/6507df2246905b20c408b2bc/8ec7584a-76cb-4262-b4c8-fa5334bff05c/Siargao+-+title.jpg' },
  { id:'BTN', name:'Batanes', province:'Cagayan Valley', summary:'Stone houses, dramatic cliffs, rolling hills, peaceful island life.', rating:4.9, image:'https://ik.imagekit.io/tvlk/blog/2018/09/Marlboro-Country-Batanes.jpg?tr=q-70,c-at_max,w-500,h-300,dpr-2' },
  { id:'CMG', name:'Camiguin', province:'Region X', summary:'Volcanoes, hot springs, White Island sandbar, refreshing waterfalls.', rating:4.6, image:'https://lifestyle.inquirer.net/files/2023/09/camiguin-White-Island-with-Hibok-Hibok-as-background.jpeg' },
  { id:'BGU', name:'Baguio', province:'Benguet', summary:'Cool climate, pine forests, mountain views, and local arts.', rating:4.5, image:'https://visita.baguio.gov.ph/assets/images/Lions%20Head.jpg' },
  { id:'DMG', name:'Dumaguete', province:'Negros Oriental', summary:'Laid-back university town, dolphin watching, diving spots.', rating:4.6, image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3IKcaSEFSnfEK4Nl5c_6gIQmnp5Fd5nInhA&s' },
  { id:'BOR',name:'Boracay',province:'Aklan',summary:'White-sand beaches, crystal-clear waters, vibrant nightlife, and famous sunset views.',rating:4.8, image: 'https://cdn.sanity.io/images/nxpteyfv/goguides/e795448cde308c144b5f8eead81b52a5b9a5f4e7-1600x1066.jpg'},
  { id:'PPC',name:'Puerto Princesa City',province:'Palawan',summary:'Underground river, eco-adventures, pristine beaches, and stunning limestone cliffs.',rating:4.7, image: 'https://gttp.images.tshiftcdn.com/225540/x/0/16-best-tourist-spots-amp-things-to-do-in-puerto-princesa-city-on-palawan-island-15.jpg?auto=compress%2Cformat&ch=Width%2CDPR&dpr=1&ixlib=php-3.3.0&w=883'},
  { id:'CHH',name:'Chocolate Hills',province:'Bohol',summary:'Iconic geological formations, scenic viewpoints, and nearby wildlife sanctuaries.',rating:4.6, image: 'https://carmen-bohol.gov.ph/wp-content/uploads/2024/03/Chocolate-Hills-Carmen.png'},
  { id:'VIG',name:'Vigan',province:'Ilocos Sur',summary:'Historic Spanish colonial town, cobblestone streets, and heritage architecture.',rating:4.7, image: 'https://gttp.images.tshiftcdn.com/223658/x/0/'},
  { id:'TAG',name:'Tagaytay',province:'Cavite',summary:'Cool climate, Taal Volcano view, and relaxing restaurants overlooking the lake.',rating:4.5, image: 'https://lakbaypinas.com/wp-content/uploads/2025/04/Snapins.ai_412919370_18407258452029118_3433284473692002855_n_1080.jpg'},
  { id:'ELN',name:'El Nido',province:'Palawan',summary:'Stunning limestone cliffs, hidden lagoons, and world-class snorkeling spots.',rating:4.9, image: 'https://www.travel-palawan.com/wp-content/uploads/2023/04/Hidden-Beach-Bacuit-Bay-El-Nido-1024x683.jpeg'}
];

// Augment destinations with gallery images
const ENRICHED_DESTINATIONS = DESTINATIONS.map(d => ({
    ...d,
    images: GALLERY_IMAGES[d.id] || [d.image, d.image]
}));

const PACKAGES: Package[] = [
  {id:1,title:'Boracay 3D/2N Beach Escape',destId:'BOR',price:129.99, type:'leisure', seats:10,description:'Beachfront hotel + island hopping'},
  {id:2,title:'Palawan Underground River Tour',destId:'PPC',price:199.99,type:'adventure',seats:8,description:'Guided cave & river tour'},
  {id:3,title:'Bohol Countryside & Chocolate Hills',destId:'CHH',price:149.50,type:'culture',seats:12,description:'Day tour with local guides'},
  {id:4,title:'Vigan Heritage Tour',destId:'VIG',price:99.99,type:'culture',seats:15,description:'Walking tour of cobblestone streets'},
  {id:5,title:'Tagaytay Day Trip',destId:'TAG',price:79.99,type:'leisure',seats:20,description:'Lunch overlooking Taal Lake'},
  {id:6,title:'El Nido Adventure Package',destId:'ELN',price:299.99,type:'adventure',seats:10,description:'Island hopping & snorkeling'},
  {id:7,title:'Cebu Historical & Whale Watching',destId:'CEB',price:169.99,type:'adventure',seats:10,description:'Explore historic sites and enjoy an optional Oslob whale shark encounter.'},
  {id:8,title:'Siargao Surfing & Island Adventure',destId:'SGO',price:249.99,type:'adventure',seats:8,description:'Surf lessons at Cloud 9, island hopping, and Magpupungko Rock Pool.'},
  {id:9,title:'Batanes Northern Hills & Cliffs',destId:'BTN',price:350.00,type:'culture',seats:6,description:'Guided tour of stone houses, lighthouses, and dramatic northern cliffs.'},
  {id:10,title:'Camiguin Volcano & White Island',destId:'CMG',price:139.00,type:'leisure',seats:12,description:'Hike around Mount Hibok-Hibok, visit the hot springs and White Island sandbar.'},
  {id:11,title:'Baguio Pine City Retreat',destId:'BGU',price:119.99,type:'leisure',seats:15,description:'Visit Burnham Park, Camp John Hay, and buy local crafts in the cool climate.'},
  {id:12,title:'Dumaguete & Apo Island Dive Trip',destId:'DMG',price:220.00,type:'adventure',seats:8,description:'Dolphin watching and a day trip for world-class diving and snorkeling at Apo Island.'},
];

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  destinations: Destination[];
  packages: Package[];
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  cancelBooking: (id: string) => void;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  itinerary: ItineraryItem[];
  addItineraryItem: (item: ItineraryItem) => void;
  comments: Record<string, Comment[]>;
  addComment: (destId: string, text: string) => void;
  ratings: Record<string, number[]>;
  addRating: (destId: string, rating: number) => void;
  isSignInOpen: boolean;
  openSignIn: () => void;
  closeSignIn: () => void;
  isSignUpOpen: boolean;
  openSignUp: () => void;
  closeSignUp: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [destinations] = useState<Destination[]>(ENRICHED_DESTINATIONS);
  const [packages] = useState<Package[]>(PACKAGES);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [ratings, setRatings] = useState<Record<string, number[]>>({});

  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const openSignIn = () => setIsSignInOpen(true);
  const closeSignIn = () => setIsSignInOpen(false);
  const openSignUp = () => setIsSignUpOpen(true);
  const closeSignUp = () => setIsSignUpOpen(false);

  const addBooking = (booking: Booking) => setBookings(prev => [...prev, booking]);
  
  const cancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  const toggleWishlist = (id: number) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const addItineraryItem = (item: ItineraryItem) => {
    setItinerary(prev => [...prev, item]);
  };

  const addComment = (destId: string, text: string) => {
    const newComment: Comment = {
      text,
      user: user?.name || 'Guest',
      date: new Date().toLocaleDateString()
    };
    setComments(prev => ({
      ...prev,
      [destId]: [newComment, ...(prev[destId] || [])]
    }));
  };

  const addRating = (destId: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [destId]: [...(prev[destId] || []), rating]
    }));
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      destinations, packages,
      bookings, addBooking, cancelBooking,
      wishlist, toggleWishlist,
      itinerary, addItineraryItem,
      comments, addComment,
      ratings, addRating,
      isSignInOpen, openSignIn, closeSignIn,
      isSignUpOpen, openSignUp, closeSignUp
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
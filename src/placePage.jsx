import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { MapPin, ArrowLeft, Coffee, Hotel, Utensils, Camera, Store } from "lucide-react";

function PlacesPage() {
  const { cityName } = useParams();
  const location = useLocation();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const coords = location.state?.coords || { lat: 0, lon: 0 };

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Places", icon: <MapPin className="category-icon" /> },
    { id: "restaurant", name: "Restaurants", icon: <Utensils className="category-icon" /> },
    { id: "cafe", name: "Cafes", icon: <Coffee className="category-icon" /> },
    { id: "hotel", name: "Hotels", icon: <Hotel className="category-icon" /> },
    { id: "attraction", name: "Attractions", icon: <Camera className="category-icon" /> },
    { id: "shop", name: "Shops", icon: <Store className="category-icon" /> }
  ];

  // Normally you would fetch this from an API like Google Places, Foursquare, etc.
  // For demo purposes, we'll create sample data based on the city name
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      
      try {
        // This would be an actual API call in a real application
        // Replace with your preferred places API
        // For example: `fetch(`https://api.example.com/places?city=${cityName}&lat=${coords.lat}&lon=${coords.lon}`)`
        
        // Simulating API response with mock data
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        
        // Generate some mock places
        const mockCategories = ["restaurant", "cafe", "hotel", "attraction", "shop"];
        const mockPlaces = [];
        
        for (let i = 1; i <= 15; i++) {
          const category = mockCategories[Math.floor(Math.random() * mockCategories.length)];
          
          mockPlaces.push({
            id: i,
            name: `${category.charAt(0).toUpperCase() + category.slice(1)} ${i}`,
            category: category,
            rating: (3 + Math.random() * 2).toFixed(1),
            address: `${Math.floor(Math.random() * 100) + 1} ${cityName} Street`,
            distance: (Math.random() * 5).toFixed(1),
            image: `/api/placeholder/400/320`
          });
        }
        
        setPlaces(mockPlaces);
      } catch (err) {
        setError("Failed to load places. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlaces();
  }, [cityName, coords]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "restaurant":
        return <Utensils className="detail-icon" />;
      case "cafe":
        return <Coffee className="detail-icon" />;
      case "hotel":
        return <Hotel className="detail-icon" />;
      case "attraction":
        return <Camera className="detail-icon" />;
      case "shop":
        return <Store className="detail-icon" />;
      default:
        return <MapPin className="detail-icon" />;
    }
  };

  const filteredPlaces = selectedCategory === "all" 
    ? places 
    : places.filter(place => place.category === selectedCategory);

  return (
    <div className="min-height-screen gradient-background-purple">
      <div className="container padding-y">
        <div className="margin-bottom">
          <Link to="/" className="back-link">
            <ArrowLeft className="back-icon" />
            Back to Weather
          </Link>
          
          <div className="text-center margin-top">
            <h1>Places in {cityName}</h1>
            <p className="subtitle">Discover interesting locations in this city</p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="category-container">
          <div className="category-list">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-button ${
                  selectedCategory === category.id 
                    ? "category-active" 
                    : "category-inactive"
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">Loading places in {cityName}...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : (
          <div className="places-grid">
            {filteredPlaces.map(place => (
              <div key={place.id} className="place-card">
                <img 
                  src={place.image} 
                  alt={place.name} 
                  className="place-image"
                />
                <div className="place-body">
                  <div className="place-header">
                    <h3 className="place-name">{place.name}</h3>
                    <span className="place-rating">
                      ★ {place.rating}
                    </span>
                  </div>
                  
                  <div className="place-category">
                    {getCategoryIcon(place.category)}
                    <span>{place.category}</span>
                  </div>
                  
                  <p className="place-address">{place.address}</p>
                  
                  <div className="place-footer">
                    <span className="place-distance">{place.distance} km away</span>
                    <button className="details-button">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && filteredPlaces.length === 0 && (
          <div className="text-center padding-y">
            <div className="empty-state">
              <MapPin className="empty-icon" />
              <h3 className="empty-title">No Places Found</h3>
              <p className="empty-text">Try selecting a different category or searching for another city.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlacesPage;
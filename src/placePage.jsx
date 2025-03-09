import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { MapPin, ArrowLeft, Coffee, Hotel, Utensils, Camera, Store, AlertTriangle } from "lucide-react";

function PlacesPage() {
  const { cityName } = useParams();
  const location = useLocation();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [googleApiLoaded, setGoogleApiLoaded] = useState(false);
  const [apiTimedOut, setApiTimedOut] = useState(false);
  
  // Get coordinates from location state or use default
  const coords = location.state?.coords || { lat: 0, lng: 0 };
  
  console.log("City coordinates:", coords); // Debug coordinates

  // Categories for filtering - with Google Place type mapping
  const categories = [
    { id: "all", name: "All Places", icon: <MapPin className="category-icon" />, types: [] },
    { id: "restaurant", name: "Restaurants", icon: <Utensils className="category-icon" />, types: ["restaurant"] },
    { id: "cafe", name: "Cafes", icon: <Coffee className="category-icon" />, types: ["cafe"] },
    { id: "hotel", name: "Hotels", icon: <Hotel className="category-icon" />, types: ["lodging"] },
    { id: "attraction", name: "Attractions", icon: <Camera className="category-icon" />, types: ["tourist_attraction", "museum", "amusement_park"] },
    { id: "shop", name: "Shops", icon: <Store className="category-icon" />, types: ["store", "shopping_mall"] }
  ];

  // Function to load the Google Maps API
  const loadGoogleMapsAPI = useCallback(() => {
    return new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleApiLoaded(true);
        resolve();
        return;
      }

      // Set a timeout to detect API loading failures
      const apiTimeout = setTimeout(() => {
        reject(new Error("Google Maps API loading timed out"));
      }, 10000); // 10 second timeout

      // Create script element to load Google Maps API
      const apiKey = "process.env.apikey"; //AIzaSyDcL_VlP2uCzbjMkzbohguAaolCVaf6iA0
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Make sure the API is fully initialized
        setTimeout(() => {
          clearTimeout(apiTimeout); // Clear the timeout on success
          if (window.google && window.google.maps && window.google.maps.places) {
            setGoogleApiLoaded(true);
            resolve();
          } else {
            reject(new Error("Google Maps API failed to initialize properly"));
          }
        }, 100); // Short delay to ensure API is fully initialized
      };
      
      script.onerror = () => {
        clearTimeout(apiTimeout); // Clear the timeout on error
        reject(new Error("Failed to load Google Maps API"));
      };
      
      // Check if script already exists to avoid duplicate loading
      const existingScript = document.querySelector(`script[src^="https://maps.googleapis.com/maps/api/js"]`);
      if (existingScript) {
        existingScript.remove();
      }
      
      document.head.appendChild(script);
    });
  }, []);

  // Function to search for places using Google Places API
  const searchPlaces = useCallback((map, service, categoryType = null) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        reject(new Error("Google Maps API not loaded"));
        return;
      }
      
      const request = {
        location: new window.google.maps.LatLng(coords.lat, coords.lng),
        radius: 5000, // 5km radius
        type: categoryType
      };

      // Set timeout for the search request
      const searchTimeout = setTimeout(() => {
        reject(new Error("Places search request timed out"));
      }, 7000); // 7 seconds timeout

      service.nearbySearch(request, (results, status) => {
        clearTimeout(searchTimeout);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          resolve([]); // No error, just no results
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }, [coords]);

  // Function to get place details
  const getPlaceDetails = useCallback((service, placeId) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        reject(new Error("Google Maps API not loaded"));
        return;
      }
      
      const request = {
        placeId: placeId,
        fields: ['name', 'rating', 'formatted_address', 'photos', 'types', 'geometry']
      };

      const detailsTimeout = setTimeout(() => {
        reject(new Error("Place details request timed out"));
      }, 5000); // 5 seconds timeout

      service.getDetails(request, (place, status) => {
        clearTimeout(detailsTimeout);
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }, []);

  // Get place category
  const determineCategory = (types) => {
    if (types.includes('restaurant')) return 'restaurant';
    if (types.includes('cafe')) return 'cafe';
    if (types.includes('lodging')) return 'hotel';
    if (types.includes('tourist_attraction') || types.includes('museum') || types.includes('amusement_park')) return 'attraction';
    if (types.includes('store') || types.includes('shopping_mall')) return 'shop';
    return 'other';
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return (R * c).toFixed(1);
  };

  // Generate mock data if needed
  const generateMockData = useCallback(() => {
    console.log("Generating mock data for:", cityName);
    const mockCategories = ['restaurant', 'cafe', 'hotel', 'attraction', 'shop'];
    const mockPlaces = [];

    for (let i = 1; i <= 10; i++) {
      const category = mockCategories[Math.floor(Math.random() * mockCategories.length)];
      mockPlaces.push({
        id: `mock-${i}`,
        name: `${cityName} ${category.charAt(0).toUpperCase() + category.slice(1)} ${i}`,
        category: category,
        rating: (3 + Math.random() * 2).toFixed(1),
        address: `${Math.floor(Math.random() * 100)} Main Street, ${cityName}`,
        distance: (Math.random() * 5).toFixed(1),
        image: `/api/placeholder/400/320`
      });
    }
    
    return mockPlaces;
  }, [cityName]);

  // Load Google Maps API on component mount
  useEffect(() => {
    let isMounted = true;

    // Set a global timeout for the entire API loading + places fetching process
    const globalTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log("API timed out, using mock data");
        setApiTimedOut(true);
        setPlaces(generateMockData());
        setLoading(false);
      }
    }, 15000); // 15 seconds for the entire process

    loadGoogleMapsAPI()
      .catch(err => {
        console.error("Failed to load Google Maps API:", err);
        if (isMounted) {
          setError("Failed to load map services. Please check your internet connection and try again.");
          // Don't set loading to false yet - let the fallback mechanism handle it
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(globalTimeout);
    };
  }, [loadGoogleMapsAPI, loading, generateMockData]);

  // Fetch places from Google Places API when API is loaded
  useEffect(() => {
    let isMounted = true;

    const fetchPlaces = async () => {
      if (!googleApiLoaded) return;
      
      if (coords.lat === 0 && coords.lng === 0) {
        setError("Location coordinates not available. Using default places.");
        setPlaces(generateMockData());
        setLoading(false);
        return;
      }
      
      try {
        // Create an invisible div for the map (required for Places API)
        const mapDiv = document.createElement('div');
        mapDiv.style.display = 'none';
        document.body.appendChild(mapDiv);
        
        // Create a map instance (required for Places Service)
        const map = new window.google.maps.Map(mapDiv, {
          center: { lat: coords.lat, lng: coords.lng },
          zoom: 15
        });
        
        // Create Places Service
        const service = new window.google.maps.places.PlacesService(map);
        
        // Fetch places from all categories
        const allPlacesPromises = [];
        const typesSet = new Set();
        
        // Get unique place types to search for
        categories.forEach(category => {
          if (category.id !== 'all') {
            category.types.forEach(type => typesSet.add(type));
          }
        });
        
        // Search for each type
        const uniqueTypes = Array.from(typesSet);
        for (const type of uniqueTypes) {
          allPlacesPromises.push(searchPlaces(map, service, type).catch(err => {
            console.warn(`Error searching for ${type}:`, err);
            return []; // Return empty array on error to continue processing
          }));
        }
        
        const allPlacesResults = await Promise.all(allPlacesPromises);
        
        // Flatten results and remove duplicates
        const placesMap = new Map();
        allPlacesResults.flat().forEach(place => {
          if (place && !placesMap.has(place.place_id)) {
            placesMap.set(place.place_id, place);
          }
        });
        
        // If no places found, use mock data
        if (placesMap.size === 0) {
          console.log("No places found via API, using mock data");
          if (isMounted) {
            setPlaces(generateMockData());
            // Clean up and return
            document.body.removeChild(mapDiv);
            setLoading(false);
          }
          return;
        }
        
        // Process top 20 places (to avoid excessive API calls)
        const topPlaces = Array.from(placesMap.values()).slice(0, 20);
        const processedPlaces = [];
        
        // Get details for each place
        const detailsPromises = topPlaces.map(place => {
          return getPlaceDetails(service, place.place_id)
            .then(details => {
              const category = determineCategory(details.types);
              const distance = calculateDistance(
                coords.lat, 
                coords.lng, 
                details.geometry.location.lat(), 
                details.geometry.location.lng()
              );
              
              return {
                id: place.place_id,
                name: details.name,
                category: category,
                rating: details.rating ? details.rating.toFixed(1) : "N/A",
                address: details.formatted_address,
                distance: distance,
                image: details.photos && details.photos.length > 0
                  ? `/api/placeholder/400/320` // Using placeholder since we can't load actual photos
                  : `/api/placeholder/400/320`
              };
            })
            .catch(err => {
              console.warn("Error fetching place details:", err);
              return null; // Return null for failed details
            });
        });
        
        const detailsResults = await Promise.all(detailsPromises);
        // Filter out null results
        processedPlaces.push(...detailsResults.filter(place => place !== null));
        
        if (isMounted) {
          if (processedPlaces.length > 0) {
            setPlaces(processedPlaces);
          } else {
            // If all details failed, use mock data
            setPlaces(generateMockData());
          }
          
          // Clean up
          document.body.removeChild(mapDiv);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error in places fetch:", err);
        if (isMounted) {
          setError("Failed to load places from Google. Showing local suggestions instead.");
          setPlaces(generateMockData());
          setLoading(false);
        }
      }
    };
    
    if (googleApiLoaded && !apiTimedOut) {
      fetchPlaces();
    }
    
    return () => {
      isMounted = false;
    };
  }, [googleApiLoaded, apiTimedOut, cityName, coords, searchPlaces, getPlaceDetails, categories, generateMockData]);

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
            <div className="error-message">
              <AlertTriangle className="error-icon" />
              <p>{error}</p>
            </div>
            {places.length > 0 && (
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
        
        {!loading && filteredPlaces.length === 0 && !error && (
          <div className="text-center padding-y">
            <div className="empty-state">
              <MapPin className="empty-icon" />
              <h3 className="empty-title">No Places Found</h3>
              <p className="empty-text">Try selecting a different category or searching for another city.</p>
            </div>
          </div>
        )}
        
        {apiTimedOut && !error && (
          <div className="notice-banner">
            <AlertTriangle className="notice-icon" />
            <p>Using local suggestions. Google Maps service is currently unavailable.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlacesPage;
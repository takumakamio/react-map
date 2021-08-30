import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css'
import { useState, useRef, useCallback } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import { Room, Star } from "@material-ui/icons";
import "./app.css";
import { useEffect } from "react";
import axios from "axios";
import { format } from "timeago.js";
import Register from "./components/Register";
import Login from "./components/Login";

function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser] = useState(myStorage.getItem("user"));
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(null);
  const [desc, setDesc] = useState(null);
  const [star, setStar] = useState(0);
  const mapRef = useRef();
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 35.85692327117018,
    longitude: 139.2924985918451,
    zoom: 4,
  });

  //Get All Pin from backend
  useEffect(() => {
    const getPins = async () => {
      try {
        const allPins = await axios.get("/pins");
        setPins(allPins.data);
      } catch (err) {
        console.log(err);
      }
    };
    getPins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      desc,
      rating: star,
      lat: newPlace.lat,
      lng: newPlace.lng,
    };

    try {
      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    myStorage.removeItem("user");
  };

  //Set a id for popup when click the Room icon
  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({ ...viewport, latitude: lat, longitude: long });
  };

  const handleAddClick = (e) => {
    const [longitude, latitude] = e.lngLat;
    setNewPlace({
      lat: latitude,
      lng: longitude,
    });
  };

  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    []
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback((newViewport) => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };

    return handleViewportChange({
      ...newViewport,
      ...geocoderDefaultOverrides,
    });
  }, []);

  return (
    <ReactMapGL
      ref={mapRef}
      {...viewport}
      onViewportChange={(nextViewport) => setViewport(nextViewport)}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
      mapStyle="mapbox://styles/takumakamio/cksnga7i00trn18nwda4vpmg0"
      onDblClick={handleAddClick}
    >
      <Geocoder
        mapRef={mapRef}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        onViewportChange={handleGeocoderViewportChange}
        position="top-left"
      />
      {pins.map((p) => (
        <>
          <Marker
            latitude={p.lat}
            longitude={p.lng}
            offsetLeft={viewport.zoom * -3.5}
            offsetTop={viewport.zoom * -7}
          >
            <Room
              style={{
                fontSize: viewport.zoom * 7,
                color: p.username === currentUser ? "tomato" : "slateblue",
                cursor: "pointer",
              }}
              onClick={() => handleMarkerClick(p._id, p.lat, p.lng)}
            />
          </Marker>
          {p._id === currentPlaceId && (
            <Popup
              latitude={p.lat}
              longitude={p.lng}
              closeButton={true}
              closeOnClick={false}
              anchor="left"
              onClose={() => setCurrentPlaceId(null)}
            >
              <div className="card">
                <label>Place</label>
                <h4 className="place">{p.title}</h4>
                <label>Review</label>
                <p className="desc">{p.desc}</p>
                <label>Rating</label>
                <div className="stars">
                  {Array(p.rating).fill(<Star className="star" />)}
                </div>
                <label>Information</label>
                <span className="username">
                  <b>{p.username}</b>
                </span>
                <span className="date">{format(p.createdAt)}</span>
              </div>
            </Popup>
          )}
        </>
      ))}
      {newPlace && currentUser && (
        <Popup
          latitude={newPlace.lat}
          longitude={newPlace.lng}
          closeButton={true}
          closeOnClick={false}
          anchor="left"
          onClose={() => setNewPlace(null)}
        >
          <div>
            <form onSubmit={handleSubmit}>
              <label>Title</label>
              <input
                placeholder="Enter a title"
                autoFocus
                onChange={(e) => setTitle(e.target.value)}
              />
              <label>Description</label>
              <textarea
                placeholder="Say us something about this place."
                onChange={(e) => setDesc(e.target.value)}
              />
              <label>Rating</label>
              <select onChange={(e) => setStar(e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <button type="submit" className="submitButton">
                Add Pin
              </button>
            </form>
          </div>
        </Popup>
      )}
      {currentUser ? (
        <button className="button logout" onClick={handleLogout}>
          Log out
        </button>
      ) : (
        <div className="buttons">
          <button
            className="button login"
            onClick={() => {
              setShowLogin(true);
              setShowRegister(false);
            }}
          >
            Log in
          </button>
          <button
            className="button register"
            onClick={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          >
            Register
          </button>
        </div>
      )}
      {showRegister && (
        <Register
          setShowRegister={setShowRegister}
          setShowLogin={setShowLogin}
        />
      )}
      {showLogin && (
        <Login
          setShowLogin={setShowLogin}
          setShowRegister={setShowRegister}
          setCurrentUser={setCurrentUser}
          myStorage={myStorage}
        />
      )}
    </ReactMapGL>
  );
}

export default App;

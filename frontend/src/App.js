import { useState } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import { Room, Star, StarBorder } from "@material-ui/icons";
import "./app.css";
import { useEffect } from "react";
import axios from "axios";
import { format } from "timeago.js";

function App() {
  const currentUser = "John";
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 46,
    longitude: 17,
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

  //Set a id for popup when click the Room icon
  const handleMarkerClick = (id) => {
    setCurrentPlaceId(id);
  };

  return (
    <ReactMapGL
      {...viewport}
      onViewportChange={(nextViewport) => setViewport(nextViewport)}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
      mapStyle="mapbox://styles/takumakamio/cksnga7i00trn18nwda4vpmg0"
    >
      {pins.map((p) => (
        <>
          <Marker
            latitude={p.lat}
            longitude={p.lng}
            offsetLeft={-20}
            offsetTop={-10}
          >
            <Room
              style={{
                fontSize: viewport.zoom * 7,
                color: p.username === currentUser ? "tomato" : "slateblue",
                cursor: "pointer",
              }}
              onClick={() => handleMarkerClick(p._id)}
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
                <lable className="label">place</lable>
                <h4 className="place">{p.title}</h4>
                <lable className="label">Review</lable>
                <p className="desc">{p.desc}</p>
                <lable className="label">Rating</lable>
                <div className="stars">
                  <Star className="star" />
                  <Star className="star" />
                  <Star className="star" />
                  <Star className="star" />
                  <Star className="star" />
                </div>
                <lable className="label">Information</lable>
                <span className="username">
                  <b>{p.username}</b>
                </span>
                <span className="date">{format(p.createdAt)}</span>
              </div>
            </Popup>
          )}
        </>
      ))}
    </ReactMapGL>
  );
}

export default App;

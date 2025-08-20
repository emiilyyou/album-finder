
import './App.css'
import { FormControl, InputGroup, Container, Button, Row, Card } from "react-bootstrap";
import { useState, useEffect } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [accessToken, setAccessToken] = useState("");
  const[searchInput, setSearchInput] = useState("");
  const [albums, setAlbums] = useState([]);
  const [sortOrder, setSortOrder] = useState("newest");

  // fetch Spotify access token
  useEffect(() => {
    const authParams = {
      method: "POST",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body:
        `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    };

    // send POST request and return as JSON response
    fetch("https://accounts.spotify.com/api/token", authParams)
    .then((result) => result.json())
    // save access token in state via setAccessToken
    .then((data) => {
      setAccessToken(data.access_token);
    });
  }, []);
  
  // search for artist and fetch albums
  async function search() {
    if (!searchInput.trim()) return; 

    const artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      },
    };
  
    try {
      const artistResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
        artistParams
      );
      const artistData = await artistResponse.json();
      const artistID = artistData.artists.items[0]?.id;

      if (artistID) {
        const albumsResponse = await fetch(
          `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
          artistParams
        );
        const albumsData = await albumsResponse.json();
        setAlbums(albumsData.items);
      }
    } catch (error) {
      console.error('Error fetching artist or albums:', error);
    }
}

// filter based on newest/oldest release
const sortedAlbums = [...albums].sort((a, b) => {
  const dateA = new Date(a.release_date);
  const dateB = new Date(b.release_date);

  if (sortOrder === "newest") {
    return dateB - dateA; // descending
  } else {
    return dateA - dateB; // ascending
  }
});

return (
  <>
    <Container className="search-bar">
      <InputGroup>
        <FormControl
          placeholder="Search for an artist"
          aria-label="Search for an Artist"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              search();
            }
          }}
          onChange={(event) => setSearchInput(event.target.value)}
          className="search-input"
        />
        <Button onClick={search}>Search</Button>
      </InputGroup>
    </Container>

    <Container className="sort-container">
      {/* coneects label (for dropdown) to select input */}
      <label htmlFor="sortOrder" className="sort-label">
          Sort by release date:
      </label>
      {/* dropdown menu to sort albums */}
      <select
        id="sortOrder"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="newest">Most Recent</option>
        <option value="oldest">Oldest </option>
      </select>
    </Container>


    <Container>
      <Row className="album-grid">
        {sortedAlbums.map((album) => (
          <Card key={album.id} className="card">
            <Card.Img
              src={album.images[0]?.url}
              className="card-img"
            />
            <Card.Body className="text-center">
              <Card.Title className="card-title">
                {album.name}
              </Card.Title>
              <Button
                href={album.external_urls.spotify}
                target="_blank"
                className="album-link"
              >
                Listen on Spotify
              </Button>
            </Card.Body>
          </Card>
        ))}
      </Row>
    </Container>
  </>
);
}

export default App;


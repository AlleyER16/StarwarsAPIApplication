import { Component, createRef } from "react";

import "./App.css";

import starWarsImg from "../assets/star-wars-logo.png";

class App extends Component {
  state = {
    films: [],
    selectedFilm: null,
    filmCharacters: null,
    selectedFilmCharacters: [],
    totalHeightCM: null,
    sort: "",
    gender: "",
    loading: "Fetching movies ...",
  };

  constructor(props) {
    super(props);

    this.mainSectionRef = createRef(null);
  }

  reloadFilmCharacters = () => {
    let characters = [...this.state.filmCharacters];

    if (this.state.gender)
      characters = characters.filter(
        (character) => character.gender === this.state.gender
      );

    if (this.state.sort) {
      this.state.sort === "asc"
        ? characters.sort((character1, character2) =>
            character1.name < character2.name ? -1 : 1
          )
        : characters.sort((character1, character2) =>
            character1.name > character2.name ? -1 : 1
          );
    }

    const totalHeightCM = characters.reduce(
      (accumulator, character) =>
        accumulator +
        (isNaN(Number(character.height)) ? 0 : Number(character.height)),
      0
    );

    this.setState({ selectedFilmCharacters: characters, totalHeightCM });
  };

  toggleOrdering = () => {
    this.setState(
      {
        sort: !this.state.sort
          ? "asc"
          : this.state.sort === "asc"
          ? "desc"
          : "asc",
      },
      this.reloadFilmCharacters
    );
  };

  selectFilm = (film) => {
    this.setState({ loading: "Fetching movie details" });

    const charactersPromise = film.characters.map((characterUrl) =>
      fetch(characterUrl).then((res) => res.json())
    );

    Promise.all(charactersPromise)
      .then((characters) => {
        this.setState(
          {
            selectedFilm: film,
            filmCharacters: characters,
            loading: "",
          },
          () => {
            this.reloadFilmCharacters();
            this.mainSectionRef.current.scrollIntoView({
              behavior: "smooth",
            });
          }
        );
      })
      .catch((err) => {
        alert("Error fetching movie details. Try again");
      });
  };

  componentDidMount() {
    fetch("https://swapi.dev/api/films/")
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching movies. Try again");

        return res.json();
      })
      .then((json) => {
        const films = json.results;
        films.sort(
          (film1, film2) =>
            new Date(film2.release_date).getTime() -
            new Date(film1.release_date).getTime()
        );
        this.setState({ films, loading: "" });
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  render() {
    return (
      <div>
        {this.state.loading ? (
          <div className="loading">
            <span className="fas fa-spinner fa-spin"></span>{" "}
            {this.state.loading}
          </div>
        ) : null}
        <div className="header-section">
          <div className="header-content">
            <img src={starWarsImg} className="header-img" alt="" />
            <div className="films-dropdown">
              <div className="films-dropdown-active">
                <ion-icon
                  name="chevron-down-outline"
                  class="films-dropdown-icon"
                ></ion-icon>
                <div className="films-dropdown-selected">
                  {this.state.selectedFilm
                    ? this.state.selectedFilm.title
                    : "Choose a movie"}
                </div>
              </div>
              <ul className="films-dropdown-menu">
                {this.state.films.map((film) => {
                  return (
                    <li
                      className="films-dropdown-menu-item"
                      key={film.episode_id}
                      onClick={() => this.selectFilm(film)}
                    >
                      {film.title}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
        {this.state.selectedFilm ? (
          <section className="main-section" ref={this.mainSectionRef}>
            <div className="film-info">
              <h3 className="film-title">{this.state.selectedFilm.title}</h3>
              <p className="film-opening-crawl">
                {this.state.selectedFilm.opening_crawl}
              </p>
              <ul className="film-extra">
                <li className="film-extra-item">
                  <span>Director:</span> {this.state.selectedFilm.director}
                </li>
                <li className="film-extra-item">
                  <span>Producer:</span> {this.state.selectedFilm.producer}
                </li>
                <li className="film-extra-item">
                  <span>Release Date:</span>{" "}
                  {this.state.selectedFilm.release_date}
                </li>
              </ul>
            </div>
            <div className="film-characters">
              <div className="filter">
                <select
                  className="gender-select"
                  value={this.state.gender}
                  onChange={(e) =>
                    this.setState(
                      { gender: e.target.value },
                      this.reloadFilmCharacters
                    )
                  }
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-heading" colSpan="4">
                      Characters
                    </th>
                  </tr>
                  <tr>
                    <th className="c-pointer">
                      <div
                        className="table-name-header"
                        onClick={this.toggleOrdering}
                      >
                        Name{" "}
                        {!this.state.sort ? null : this.state.sort === "asc" ? (
                          <ion-icon name="chevron-up-outline"></ion-icon>
                        ) : (
                          <ion-icon name="chevron-down-outline"></ion-icon>
                        )}
                      </div>
                    </th>
                    <th>Gender</th>
                    <th>Height</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.selectedFilmCharacters.map((character, index) => {
                    return (
                      <tr key={index}>
                        <td>{character.name}</td>
                        <td>
                          {["male", "female", "hermaphrodite"].includes(
                            character.gender
                          )
                            ? character.gender[0].toUpperCase()
                            : "N/A"}
                        </td>
                        <td>
                          {character.height !== "unknown"
                            ? `${character.height}cm`
                            : "--"}
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <th>
                      {this.state.selectedFilmCharacters.length} characters in
                      current selection
                    </th>
                    <th>Total Height:</th>
                    <th>
                      {this.state.totalHeightCM}cm (
                      {(this.state.totalHeightCM / 30.48).toFixed(2)}ft/
                      {(this.state.totalHeightCM / 2.54).toFixed(2)}in)
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    );
  }
}

export default App;

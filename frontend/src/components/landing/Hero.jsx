import { Link } from "react-router-dom";
import "./Hero.css";

import library from "../../assets/images/library.jpg";

function Hero() {
  return (
    <section className="hero" id="home">
      <img src={library} alt="Library" className="hero-image" />

      <div className="overlay"></div>

      <div className="hero-content">
        <span className="hero-subtitle">Welcome to Kabarak University Library</span>

        <h1>
          Discover Knowledge.
          <br />
          Inspire Learning.
          <br />
          Build the Future.
        </h1>

        <p>
          The Kabarak University Library provides quality information resources, modern learning
          spaces and innovative services that empower teaching, research and lifelong learning.
        </p>

        <div className="hero-buttons">
          <a href="#services" className="explore">
            Explore Library
          </a>

          <Link to="/login" className="login">
            Librarian Login
          </Link>
        </div>
      </div>

      <div className="scroll-down">↓</div>
    </section>
  );
}

export default Hero;

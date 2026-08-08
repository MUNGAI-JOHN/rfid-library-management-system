import aboutImage from "../../assets/images/about-library.jpg";
import "./About.css";

function About() {
  return (
    <section className="about" id="about">
      <div className="about-container">
        <div className="about-image">
          <img src={aboutImage} alt="Library" />
        </div>

        <div className="about-content">
          <span>ABOUT OUR LIBRARY</span>

          <h2>Empowering Academic Excellence Through Knowledge</h2>

          <p>
            Kabarak University Library provides access to quality information resources, digital
            collections and modern learning spaces that support teaching, research and lifelong
            learning.
          </p>

          <div className="features">
            <div className="feature">
              <span>✔</span>
              Modern Learning Spaces
            </div>

            <div className="feature">
              <span>✔</span>
              Digital Resources
            </div>

            <div className="feature">
              <span>✔</span>
              Research Support
            </div>

            <div className="feature">
              <span>✔</span>
              Qualified Library Staff
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;

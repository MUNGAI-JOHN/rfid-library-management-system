import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Library Info */}
        <div className="footer-section">
          <h2>Kabarak University Library</h2>

          <p>
            Empowering learning, research and innovation by providing quality information resources,
            modern facilities and excellent library services.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>

          <ul>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#services">Services</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#gallery">Gallery</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
        </div>

        {/* Opening Hours */}
        <div className="footer-section">
          <h3>Opening Hours</h3>

          <p>Monday - Friday</p>
          <span>8:00 AM - 10:00 PM</span>

          <p>Saturday</p>
          <span>9:00 AM - 6:00 PM</span>

          <p>Sunday</p>
          <span>Closed</span>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact</h3>

          <p>📍 Kabarak University</p>

          <p>Nakuru, Kenya</p>

          <p>☎ +254 700 000 000</p>

          <p>✉ library@kabarak.ac.ke</p>

          <div className="socials">
            <a href="/">🌐</a>

            <a href="/">📘</a>

            <a href="/">📸</a>

            <a href="/">▶</a>
          </div>
        </div>
      </div>

      <hr />

      <div className="copyright">
        © {new Date().getFullYear()} Kabarak University Library. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;

import "./Gallery.css";

import img1 from "../../assets/images/gallery1.jpg";
import img2 from "../../assets/images/gallery2.jpg";
import img3 from "../../assets/images/gallery3.jpg";
import img4 from "../../assets/images/gallery4.jpg";
import img5 from "../../assets/images/gallery5.jpg";
import img6 from "../../assets/images/gallery6.jpg";

function Gallery() {
  const images = [img1, img2, img3, img4, img5, img6];

  return (
    <section className="gallery" id="gallery">
      <div className="gallery-header">
        <h2>Library Gallery</h2>

        <p>
          Explore our modern learning spaces, digital facilities and comfortable study environment.
        </p>
      </div>

      <div className="gallery-grid">
        {images.map((image, index) => (
          <div className="gallery-card" key={index}>
            <img src={image} alt="Library" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Gallery;

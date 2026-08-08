import About from "../components/landing/About";
import Footer from "../components/landing/Footer";
import Gallery from "../components/landing/Gallery";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";
import Services from "../components/landing/Services";
import Statistics from "../components/landing/Statistics";

function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <About />
      <Statistics />
      <Gallery />
      <Footer />
    </>
  );
}

export default Landing;

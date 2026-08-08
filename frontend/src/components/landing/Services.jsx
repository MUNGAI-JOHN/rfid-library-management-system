import "./Services.css";

function Services() {
  const services = [
    {
      icon: "📚",
      title: "Book Collections",
      description:
        "Browse thousands of academic books, journals and reference materials across different disciplines.",
    },

    {
      icon: "💻",
      title: "Digital Resources",
      description:
        "Access e-books, online journals, research databases and digital learning materials.",
    },

    {
      icon: "📖",
      title: "Borrowing Services",
      description:
        "Borrow and return library resources quickly through our modern library management system.",
    },

    {
      icon: "🏛️",
      title: "Study Spaces",
      description:
        "Enjoy quiet reading areas and collaborative study spaces designed for effective learning.",
    },

    {
      icon: "👨‍🏫",
      title: "Research Support",
      description: "Receive guidance on academic research, referencing and information discovery.",
    },

    {
      icon: "💡",
      title: "Information Literacy",
      description: "Develop skills in locating, evaluating and using information effectively.",
    },
  ];

  return (
    <section className="services" id="services">
      <div className="services-header">
        <h2>Library Services</h2>

        <p>
          Supporting learning, teaching, research and innovation through quality library services.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div className="service-card" key={index}>
            <div className="service-icon">{service.icon}</div>

            <h3>{service.title}</h3>

            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Services;

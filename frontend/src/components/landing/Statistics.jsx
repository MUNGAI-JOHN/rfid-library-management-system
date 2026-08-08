import { useEffect, useState } from "react";
import "./Statistics.css";

function Counter({ end }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;

    const duration = 2000;

    const increment = end / (duration / 20);

    const timer = setInterval(() => {
      start += increment;

      if (start >= end) {
        setCount(end);

        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [end]);

  return count;
}

function Statistics() {
  const stats = [
    {
      icon: "📚",
      number: 50000,
      title: "Books",
    },

    {
      icon: "👨‍🎓",
      number: 8500,
      title: "Students",
    },

    {
      icon: "📖",
      number: 12000,
      title: "Borrowings",
    },

    {
      icon: "💻",
      number: 350,
      title: "Computers",
    },
  ];

  return (
    <section className="statistics">
      <div className="statistics-header">
        <h2>Library At A Glance</h2>

        <p>Supporting academic excellence through quality resources, services and innovation.</p>
      </div>

      <div className="statistics-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon">{item.icon}</div>

            <h2>
              <Counter end={item.number} />+
            </h2>

            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Statistics;

import "./DashboardCards.css";

import { FaBook, FaDoorOpen, FaExchangeAlt, FaExclamationTriangle, FaUsers } from "react-icons/fa";

function DashboardCards() {
  const cards = [
    {
      title: "Books",
      value: 520,
      icon: <FaBook />,
      color: "#0B6E4F",
    },
    {
      title: "Patrons",
      value: 135,
      icon: <FaUsers />,
      color: "#1E88E5",
    },
    {
      title: "Borrowed",
      value: 28,
      icon: <FaExchangeAlt />,
      color: "#F9A825",
    },
    {
      title: "Inside Library",
      value: 17,
      icon: <FaDoorOpen />,
      color: "#8E24AA",
    },
    {
      title: "Alerts",
      value: 2,
      icon: <FaExclamationTriangle />,
      color: "#E53935",
    },
  ];

  return (
    <div className="cards-container">
      {cards.map((card, index) => (
        <div className="card" key={index}>
          <div className="card-icon" style={{ backgroundColor: card.color }}>
            {card.icon}
          </div>

          <div className="card-info">
            <h4>{card.title}</h4>
            <h2>{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCards;

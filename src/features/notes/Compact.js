import React, { useState, useEffect } from "react";
import CompactContentList from "./CompactContentList";

const Compact = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    // Simulating data fetching
    const fetchCards = async () => {
      // In a real application, you would fetch data from an API here
      const mockData = [
        {
          votes: 190,
          image: "/api/placeholder/40/40",
          title: "Hong Myung-bo's last appearance + Ulsan Official",
          category: "Domestic Football",
          source: "Chat",
          timeAgo: "10 minutes",
          author: "Ulsan Hyundai Fans",
          commentCount: 111,
        },
        {
          votes: 312,
          image: "/api/placeholder/40/40",
          title: "Lawyers who helped Tzuyang appear",
          category: "humor",
          source: "I need to quit Into",
          timeAgo: "16 minutes",
          author: "",
          commentCount: 110,
        },
        {
          votes: 531,
          image: "/api/placeholder/40/40",
          title:
            "The National Agricultural Cooperative Federation has started to make Hong Myung-bo's image unfollowed",
          category: "humor",
          source: "Groomi",
          timeAgo: "16 minutes",
          author: "",
          commentCount: 145,
        },
        {
          votes: 147,
          image: "/api/placeholder/40/40",
          title: "[Official] Galaxy Watch New Product Price Revealed",
          category: "Digital - Information Sharing",
          source: "Grand Twins",
          timeAgo: "24 minutes",
          author: "",
          commentCount: 363,
        },
        {
          votes: 111,
          image: "/api/placeholder/40/40",
          title:
            "[FotMob] \"Full-time for all Euro matches\" Today's England CDM 'Declan Rice'...",
          category: "Overseas Football - Arsenal FC",
          source: "Yorkshire Pirlo",
          timeAgo: "24 minutes",
          author: "",
          commentCount: 108,
        },
      ];

      setCards(mockData);
    };

    fetchCards();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Latest Posts</h1>
      <CompactContentList cards={cards} />
    </div>
  );
};

export default Compact;

import React from "react";
import { ArrowUp } from "lucide-react";

const CompactContentList = ({ cards }) => {
  return (
    <div className="space-y-2">
      {cards.map((card, index) => (
        <div
          key={index}
          className="flex items-start space-x-2 p-2 bg-white rounded shadow"
        >
          <div className="flex flex-col items-center">
            <ArrowUp className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">{card.votes}</span>
          </div>
          <img
            src={card.image || "/api/placeholder/40/40"}
            alt=""
            className="w-10 h-10 object-cover rounded"
          />
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-blue-600">
              {card.title}
            </h3>
            <div className="text-xs text-gray-500">
              <span>{card.category}</span> - <span>{card.source}</span>
            </div>
            <div className="text-xs text-gray-400">
              {card.timeAgo} ago / {card.author}
            </div>
          </div>
          {card.commentCount && (
            <div className="text-xs text-gray-500 self-end">
              [{card.commentCount}]
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CompactContentList;

import React from "react";
import { Coffee, Share2, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="about-container">
      <h1 className="title">
        <Coffee className="icon" /> About Koffee Donut
      </h1>
      <div className="content">
        <p className="tagline">Take a sip! It's Koffee Donut time!</p>
        <p className="intro">
          Embrace that morning peace when you want to catch up on what's
          happening around you and the world. Spend a few minutes reviewing the
          most interesting tidbits of the day!
        </p>
        <p className="subtitle">Sharing made simple and fun!</p>
        <p>
          Ever stumbled upon a hilarious meme, fascinating post, or intriguing
          information you were itching to share, but dreaded the hassle of
          posting it across multiple group chats?
        </p>
        <p>
          Koffee Donut brews up the perfect solution! Simply paste any social
          media link, and we'll serve up the content for your followers (friends
          and family) to enjoy.
        </p>
        <p className="subtitle">We support a rich blend of content:</p>
        <ul>
          <li>YouTube videos</li>
          <li>X (Twitter) posts</li>
          <li>Instagram photos and stories</li>
          <li>Short-form content (Shorts &amp; Reels)</li>
<<<<<<< HEAD
          <li>Direct image & video uploads</li>
=======
          <li>Direct image uploads</li>
>>>>>>> c5a6b7df98f694191c674c3f2879425a51b3af48
        </ul>
        <p className="instruction">
          Just click "Share" on your social media post, copy the link, and paste
          it into your Koffee Donut note. It's that easy!
        </p>
        <p className="subtitle">We Got Trending Feature Also!</p>

        <div className="feature">
          <TrendingUp className="icon" />
          <p>
            <strong>Trending Notes:</strong> Ever wondered what memes are
            currently making waves? Our trending section is your ultimate meme
            barista! Discover the most viral content and stay up-to-date with
            internet culture.
          </p>
        </div>
        <div className="signature">
          <p>Enjoy your stay and keep the good vibes brewing!</p>
        </div>
      </div>
      <style jsx>{`
        .about-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 32px;
          background-color: #fff8e1;
          border-radius: 12px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        .title {
          font-size: 36px;
          font-weight: bold;
          color: #4e342e;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
        }
        .icon {
          margin-right: 12px;
        }
        .content {
          color: #3e2723;
          font-size: 16px;
          line-height: 1.6;
        }
        .tagline {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #795548;
        }
        .intro {
          font-style: italic;
          margin-bottom: 24px;
          color: #5d4037;
        }
        .subtitle {
          font-size: 20px;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 16px;
          color: #6d4c41;
        }
        ul {
          list-style-type: disc;
          padding-left: 24px;
          margin-bottom: 20px;
        }
        li {
          margin-bottom: 8px;
        }
        .instruction {
          font-style: italic;
          margin-bottom: 24px;
          background-color: #ffe0b2;
          padding: 12px;
          border-radius: 8px;
        }
        .feature {
          display: flex;
          align-items: flex-start;
          margin-top: 24px;
          background-color: #d7ccc8;
          padding: 16px;
          border-radius: 8px;
        }
        .feature .icon {
          flex-shrink: 0;
          margin-top: 4px;
        }
        .signature {
          text-align: right;
          margin-top: 32px;
          font-style: italic;
        }
        .admin {
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-top: 8px;
        }
        p {
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default About;

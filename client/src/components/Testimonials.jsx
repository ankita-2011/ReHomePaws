import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const testimonials = [
  {
    name: "Aarav Sharma",
    text: "ReHomePaws helped me find a loving home for my dog Bruno. The process was smooth and stress-free."
  },
  {
    name: "Priya Mehta",
    text: "I adopted my cat Luna through ReHomePaws. The platform made it easy to connect with the owner."
  },
  {
    name: "Rohan Verma",
    text: "Listing my pet was simple and I received genuine adoption requests quickly. Highly recommended!"
  },
  {
    name: "Sneha Kapoor",
    text: "ReHomePaws gave me the opportunity to adopt my best friend. The journey was seamless."
  },
  {
    name: "Kunal Singh",
    text: "A trustworthy platform for pet adoption. I found a caring family for my pet within days."
  }
];

function Testimonials() {
  const [index, setIndex] = useState(0);

  const prevSlide = () => {
    setIndex(index === 0 ? testimonials.length - 1 : index - 1);
  };

  const nextSlide = () => {
    setIndex(index === testimonials.length - 1 ? 0 : index + 1);
  };

  return (
    <section className="testimonials-section">
      <h2 className="testimonials-title">Testimonials</h2>

      <div className="testimonial-container">
        <button className="arrow left" onClick={prevSlide} aria-label="Previous testimonial">
          <FaChevronLeft />
        </button>

        <div className="testimonial-card">
          <h3>{testimonials[index].name}</h3>
          <p>"{testimonials[index].text}"</p>
        </div>

        <button className="arrow right" onClick={nextSlide} aria-label="Next testimonial">
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}

export default Testimonials;
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import { supabaseFetch } from "../../services/supabaseService";

export default function HomePage() {
  const headingRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    async function getEvents() {
      const data = await supabaseFetch("events?order=date.asc");
      setEvents(data);
    }

    getEvents();
  }, []);

  const categories = [
    "Alle",
    ...new Set(events.map((event) => event.category)),
  ];

  const filteredEvents = events.filter((event) => {
    const searchText =
      `${event.title} ${event.summary} ${event.venueName}`.toLowerCase();
    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesCategory = category === "Alle" || event.category === category;

    return matchesSearch && matchesCategory;
  });

  function formatEventDate(eventDate) {
    const date = new Date(eventDate);
    const formattedDate = date.toLocaleDateString("da-DK", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }

  return (
    <>
      <header className="hero">
        <h3 className="eyebrow">Kultur i Aarhus</h3>
        <h1 ref={headingRef} tabIndex={-1}>
          Find plads til noget nyt.
        </h1>
        <h2 className="hero-subheading">
          Koncerter, talks og workshops samlet ét sted. Find dit næste event, og
          tilmeld dig på få minutter.
        </h2>
        <a className="hero-link" href="#events">
          Se kommende events ↓
        </a>
      </header>

      <main id="events">
        <section className="section-heading">
          <div>
            <h3 className="eyebrow dark">Det sker</h3>
            <h2>Kommende events</h2>
          </div>
          <h3>
            Kuraterede oplevelser i byen – fra små scener til store idéer.
          </h3>
        </section>

        <section className="filters">
          <label>
            Søg
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Søg efter titel eller sted"
            />
          </label>
          <label>
            Kategori
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </section>

        <section className="event-grid">
          {filteredEvents.map((event) => (
            <article className="event-card" key={event.id}>
              <img src={event.image} alt="" />
              <div className="event-card-content">
                <p className="event-category">{event.category}</p>
                <h3>{event.title}</h3>
                <p>{event.summary}</p>
                <div className="event-meta">
                  <span>{formatEventDate(event.date)}</span>
                  <span>{event.venueName}</span>
                </div>
                <Link className="card-link" to={`/events/${event.id}`}>
                  Læs mere
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}

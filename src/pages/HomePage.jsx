import { useEffect, useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import { supabaseFetch } from "../../services/supabaseService";

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function getEvents() {
      try {
        setIsLoading(true);
        setError("");

        const data = await supabaseFetch("events?select=*,venue:venues(*)");

        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);

        setError(
          "Vi kunne desværre ikke hente de kommende events. Prøv igen senere.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    getEvents();
  }, []);

  const categories = [
    "Alle",
    ...new Set(events.map((event) => event.category).filter(Boolean)),
  ];

  const filteredEvents = events.filter((event) => {
    const searchText = `
      ${event.title ?? ""}
      ${event.summary ?? ""}
      ${event.venue?.name ?? ""}
    `.toLowerCase();

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
        <h2 className="eyebrow">Kultur i Aarhus</h2>

        <h1>Find plads til noget nyt.</h1>

        <h3 className="hero-copy">
          Koncerter, talks og workshops samlet ét sted. Find dit næste event, og
          tilmeld dig på få minutter.
        </h3>

        <a className="hero-link" href="#events">
          Se kommende events ↓
        </a>
      </header>

      <main id="events">
        <section className="section-heading">
          <div>
            <p className="eyebrow dark">Det sker</p>
            <h2>Kommende events</h2>
          </div>

          <p>Kuraterede oplevelser i byen – fra små scener til store idéer.</p>
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
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </section>

        {isLoading && <p className="status-message">Henter events...</p>}

        {error && (
          <div className="error-message" role="alert">
            <h3>Der opstod en fejl</h3>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && filteredEvents.length === 0 && (
          <div className="empty-message">
            <h3>Ingen events fundet</h3>
            <p>Prøv at ændre din søgning eller vælge en anden kategori.</p>
          </div>
        )}

        {!isLoading && !error && filteredEvents.length > 0 && (
          <section className="event-grid">
            {filteredEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <article className="event-card">
                  <img src={event.image} alt={event.title} />

                  <div className="event-card-content">
                    <p className="event-category">{event.category}</p>

                    <h3>{event.title}</h3>

                    <p>{event.summary}</p>

                    <div className="event-meta">
                      <span>{formatEventDate(event.date)}</span>
                      <span>{event.venue?.name ?? "Sted ikke angivet"}</span>
                    </div>

                    <div className="card-link">
                      <p>Læs mere</p>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

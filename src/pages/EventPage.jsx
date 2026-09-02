import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import Footer from "../components/Footer";
import { supabaseFetch } from "../../services/supabaseService";
import RegistrationForm from "../components/RegistrationForm";

export default function EventPage() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const headingRef = useRef(null);

  useEffect(() => {
    if (event) {
      headingRef.current?.focus();
    }
  }, [event]);

  useEffect(() => {
    async function getEvent() {
      try {
        setIsLoading(true);
        setError("");

        const data = await supabaseFetch(
          `events?id=eq.${eventId}&select=*,venue:venues(id,name,address,postalcode,city,website)`,
        );

        if (!data.length) {
          setError("Eventet kunne ikke findes.");
          return;
        }

        setEvent(data[0]);
      } catch (error) {
        console.error("Error loading event:", error);
        setError("Vi kunne desværre ikke hente eventet. Prøv igen senere.");
      } finally {
        setIsLoading(false);
      }
    }

    getEvent();
  }, [eventId]);

  if (isLoading) {
    return <p className="status-message">Henter event...</p>;
  }

  if (error) {
    return (
      <>
        <main className="event-page">
          <Link className="back-link" to="/">
            ← Alle events
          </Link>

          <div className="error-message" role="alert">
            <h1>Der opstod en fejl</h1>
            <p>{error}</p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (!event) {
    return null;
  }

  const date = new Date(event.date);

  return (
    <>
      <main className="event-page">
        <Link className="back-link" to="/">
          ← Alle events
        </Link>

        <section className="event-detail">
          <img
            ref={headingRef}
            tabIndex={-1}
            src={event.image}
            alt={event.title}
          />

          <div className="event-detail-content">
            <p className="event-category">{event.category}</p>

            <h1>{event.title}</h1>

            <p className="lead">{event.summary}</p>

            <div className="detail-list">
              <p>
                <strong>Dato</strong>
                {date.toLocaleDateString("da-DK", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                kl.{" "}
                {date.toLocaleTimeString("da-DK", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <p>
                <strong>Sted</strong>

                <span>
                  {event.venue?.name ?? "Sted ikke angivet"}

                  {event.venue?.address && (
                    <>
                      <br />
                      {event.venue.address}
                    </>
                  )}

                  {event.venue?.postalcode && (
                    <>
                      <br />
                      {event.venue.postalcode} {event.venue.city}
                    </>
                  )}

                  {event.venue?.website && (
                    <>
                      <br />
                      <a
                        href={event.venue.website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Besøg venue
                      </a>
                    </>
                  )}
                </span>
              </p>

              <p>
                <strong>Pris</strong>
                {event.price === 0 ? "Gratis" : `${event.price} kr.`}
              </p>
            </div>

            <p>{event.description}</p>
          </div>
        </section>

        <RegistrationForm event={event} />
      </main>

      <Footer />
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import {
  supabaseDelete,
  supabaseFetch,
  supabaseUpdate,
} from "../../services/supabaseService";

export default function RegistrationsPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    async function getEventsWithRegistrations() {
      try {
        setIsLoading(true);
        setError("");

        const data = await supabaseFetch(
          "events?select=id,title,date,registrations(id,name,email,confirmed,createdAt)&order=date.asc&registrations.order=createdAt.desc",
        );

        setEvents(data);
      } catch (error) {
        console.error("Error loading registrations:", error);
        setError("Tilmeldingerne kunne ikke hentes.");
      } finally {
        setIsLoading(false);
      }
    }

    getEventsWithRegistrations();
  }, []);

  const registrationCount = events.reduce(
    (total, event) => total + (event.registrations?.length ?? 0),
    0,
  );

  const selectedEvent = events.find(
    (event) => String(event.id) === selectedEventId,
  );

  const allRegistrations = events
    .flatMap((event) =>
      (event.registrations ?? []).map((registration) => ({
        ...registration,
        eventTitle: event.title,
      })),
    )
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;

      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    });

  async function confirmRegistration(registration) {
    if (registration.confirmed) {
      return;
    }

    try {
      setUpdatingId(registration.id);
      setError("");

      await supabaseUpdate(
        `registrations?id=eq.${encodeURIComponent(registration.id)}`,
        {
          confirmed: true,
        },
      );

      setEvents((currentEvents) =>
        currentEvents.map((event) => ({
          ...event,
          registrations: (event.registrations ?? []).map((item) =>
            item.id === registration.id ? { ...item, confirmed: true } : item,
          ),
        })),
      );
    } catch (error) {
      console.error("Error confirming registration:", error);
      setError("Tilmeldingen kunne ikke bekræftes. Prøv igen.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteRegistration(registration) {
    const shouldDelete = window.confirm(
      `Er du sikker på, at du vil slette tilmeldingen fra ${registration.name}?`,
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingId(registration.id);
      setError("");

      await supabaseDelete(
        `registrations?id=eq.${encodeURIComponent(registration.id)}`,
      );

      setEvents((currentEvents) =>
        currentEvents.map((event) => ({
          ...event,
          registrations: (event.registrations ?? []).filter(
            (item) => item.id !== registration.id,
          ),
        })),
      );
    } catch (error) {
      console.error("Error deleting registration:", error);
      setError("Tilmeldingen kunne ikke slettes. Prøv igen.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatEventDate(eventDate) {
    return new Date(eventDate).toLocaleDateString("da-DK", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function renderRegistrationTable(registrations, showEventColumn = false) {
    if (registrations.length === 0) {
      return (
        <p className="no-registrations">Der er endnu ingen tilmeldinger.</p>
      );
    }

    return (
      <div className="registration-table-wrapper">
        <table
          className={`registration-table ${
            showEventColumn ? "registration-table-all" : ""
          }`}
        >
          <thead>
            <tr>
              <th>Navn</th>
              <th>E-mail</th>

              {showEventColumn && <th>Event</th>}

              <th>Tilmeldt</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {registrations.map((registration) => {
              const isUpdating = updatingId === registration.id;

              const isDeleting = deletingId === registration.id;

              return (
                <tr key={registration.id}>
                  <td>
                    <strong>{registration.name}</strong>
                  </td>

                  <td>{registration.email}</td>

                  {showEventColumn && <td>{registration.eventTitle}</td>}

                  <td>
                    {registration.createdAt
                      ? new Date(registration.createdAt).toLocaleDateString(
                          "da-DK",
                        )
                      : "–"}
                  </td>

                  <td>
                    <div className="registration-actions">
                      <button
                        className={`status ${
                          registration.confirmed
                            ? "status-confirmed"
                            : "status-new"
                        }`}
                        type="button"
                        disabled={
                          registration.confirmed || isUpdating || isDeleting
                        }
                        onClick={() => confirmRegistration(registration)}
                      >
                        {isUpdating
                          ? "Bekræfter..."
                          : registration.confirmed
                            ? "Bekræftet"
                            : "Ny"}
                      </button>

                      <button
                        className="delete-button"
                        type="button"
                        disabled={isDeleting || isUpdating}
                        onClick={() => deleteRegistration(registration)}
                      >
                        {isDeleting ? "Sletter..." : "Slet"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <header className="admin-header">
        <p className="eyebrow">Internt overblik</p>

        <h1 ref={headingRef} tabIndex={-1}>
          Tilmeldinger
        </h1>

        <p>{registrationCount} tilmeldinger i alt</p>
      </header>

      <main>
        {isLoading && <p className="status-message">Henter tilmeldinger...</p>}

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <section className="registration-filter">
              <label htmlFor="event-filter">Vis tilmeldinger for</label>

              <select
                id="event-filter"
                value={selectedEventId}
                onChange={(event) => setSelectedEventId(event.target.value)}
              >
                <option value="all">Alle events</option>

                {events.map((event) => (
                  <option key={event.id} value={String(event.id)}>
                    {event.title}
                  </option>
                ))}
              </select>
            </section>

            {selectedEventId === "all" ? (
              <section className="event-registration-section">
                <div className="event-registration-heading">
                  <div>
                    <p className="eyebrow dark">Alle events</p>

                    <h2>Alle tilmeldinger</h2>
                  </div>

                  <p>
                    {allRegistrations.length}{" "}
                    {allRegistrations.length === 1
                      ? "tilmelding"
                      : "tilmeldinger"}
                  </p>
                </div>

                {renderRegistrationTable(allRegistrations, true)}
              </section>
            ) : (
              selectedEvent && (
                <section className="event-registration-section">
                  <div className="event-registration-heading">
                    <div>
                      <p className="eyebrow dark">Event</p>
                      <h2>{selectedEvent.title}</h2>
                    </div>

                    <div>
                      <p>{formatEventDate(selectedEvent.date)}</p>

                      <p>
                        {selectedEvent.registrations?.length ?? 0}{" "}
                        {(selectedEvent.registrations?.length ?? 0) === 1
                          ? "tilmelding"
                          : "tilmeldinger"}
                      </p>
                    </div>
                  </div>

                  {renderRegistrationTable(selectedEvent.registrations ?? [])}
                </section>
              )
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

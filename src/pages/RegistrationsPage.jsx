import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import {
  supabaseDelete,
  supabaseFetch,
  supabaseUpdate,
} from "../../services/supabaseService";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getRegistrations() {
      try {
        setError("");

        const data = await supabaseFetch("registrations?order=createdAt.desc");

        setRegistrations(data);
        setRegistrationCount(data.length);
      } catch (error) {
        console.error("Error loading registrations:", error);
        setError("Tilmeldingerne kunne ikke hentes.");
      }
    }

    getRegistrations();
  }, []);

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

      setRegistrations((currentRegistrations) =>
        currentRegistrations.map((item) =>
          item.id === registration.id ? { ...item, confirmed: true } : item,
        ),
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

      setRegistrations((currentRegistrations) =>
        currentRegistrations.filter((item) => item.id !== registration.id),
      );

      setRegistrationCount((currentCount) => Math.max(0, currentCount - 1));
    } catch (error) {
      console.error("Error deleting registration:", error);
      setError("Tilmeldingen kunne ikke slettes. Prøv igen.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <header className="admin-header">
        <p className="eyebrow">Internt overblik</p>
        <h1>Tilmeldinger</h1>
        <p>{registrationCount} tilmeldinger i alt</p>
      </header>

      <main>
        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="registration-list">
          <div className="registration-list-row registration-labels">
            <span>Navn</span>
            <span>Event</span>
            <span>Dato</span>
            <span>Status</span>
          </div>

          {registrations.map((registration) => {
            const isUpdating = updatingId === registration.id;
            const isDeleting = deletingId === registration.id;

            return (
              <div className="registration-row" key={registration.id}>
                <div>
                  <strong>{registration.name}</strong>
                  <small>{registration.email}</small>
                </div>

                <span>{registration.eventTitle}</span>

                <span>
                  {new Date(registration.eventDate).toLocaleDateString("da-DK")}
                </span>

                <button
                  className={`status ${
                    registration.confirmed ? "status-confirmed" : "status-new"
                  }`}
                  type="button"
                  disabled={registration.confirmed || isUpdating || isDeleting}
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
            );
          })}
        </div>
      </main>

      <Footer />
    </>
  );
}

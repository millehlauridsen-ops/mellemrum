import { useState } from "react";
import { supabaseInsert } from "../../services/supabaseService";

export default function RegistrationForm({
  event,
  isFull,
  onRegistrationSuccess,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(eventSubmit) {
    eventSubmit.preventDefault();

    if (isFull) {
      setMessage("Eventet er desværre fyldt.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await supabaseInsert("registrations", {
        name,
        email,
        eventId: event.id,
        confirmed: false,
      });

      setName("");
      setEmail("");
      setMessage("Du er nu tilmeldt eventet.");
      onRegistrationSuccess?.();
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("Tilmeldingen kunne ikke gennemføres. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="signup-panel">
      <div>
        <p className="eyebrow dark">Tilmelding</p>
        <h2>{isFull ? "Eventet er fyldt" : "Reserver din plads"}</h2>
        <p>
          {isFull
            ? "Der er desværre ikke flere ledige pladser til dette event."
            : "Udfyld formularen, så sender vi din tilmelding til arrangøren."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Navn
          <input
            type="text"
            value={name}
            onChange={(inputEvent) => setName(inputEvent.target.value)}
            placeholder="Dit navn"
            disabled={isFull}
            required
          />
        </label>

        <label>
          E-mail
          <input
            type="email"
            value={email}
            onChange={(inputEvent) => setEmail(inputEvent.target.value)}
            placeholder="dig@example.com"
            disabled={isFull}
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting || isFull}>
          {isFull
            ? "Ingen ledige pladser"
            : isSubmitting
              ? "Sender..."
              : "Tilmeld mig"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </section>
  );
}

import { useState } from "react";
import { supabaseInsert } from "../../services/supabaseService";

export default function RegistrationForm({ event }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(eventSubmit) {
    eventSubmit.preventDefault();

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
        <h2>Reserver din plads</h2>
        <p>Udfyld formularen, så sender vi din tilmelding til arrangøren.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Navn
          <input
            type="text"
            value={name}
            onChange={(inputEvent) => setName(inputEvent.target.value)}
            placeholder="Dit navn"
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
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sender..." : "Tilmeld mig"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </section>
  );
}

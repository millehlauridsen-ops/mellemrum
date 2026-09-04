import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import { supabaseFetch, supabaseInsert } from "../../services/supabaseService";

const initialForm = {
  title: "",
  category: "",
  date: "",
  price: "",
  capacity: "",
  venueId: "",
  image: "",
  summary: "",
  description: "",
};

const initialVenueForm = {
  name: "",
  address: "",
  postalcode: "",
  city: "",
  website: "",
};

const NEW_VENUE_VALUE = "new";

export default function AddEventPage() {
  const [form, setForm] = useState(initialForm);
  const [venues, setVenues] = useState([]);
  const [venueForm, setVenueForm] = useState(initialVenueForm);
  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    async function getVenues() {
      try {
        setIsLoadingVenues(true);
        setError("");

        const data = await supabaseFetch(
          "venues?select=id,name&order=name.asc",
        );

        setVenues(data);
      } catch (error) {
        console.error("Error loading venues:", error);
        setError("Spillestederne kunne ikke hentes.");
      } finally {
        setIsLoadingVenues(false);
      }
    }

    getVenues();
  }, []);

  function handleChange(inputEvent) {
    const { name, value } = inputEvent.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleVenueChange(inputEvent) {
    const { name, value } = inputEvent.target;

    setVenueForm((currentVenueForm) => ({
      ...currentVenueForm,
      [name]: value,
    }));
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");
      setError("");

      let venueId = form.venueId;

      if (form.venueId === NEW_VENUE_VALUE) {
        const createdVenues = await supabaseInsert("venues", {
          name: venueForm.name.trim(),
          address: venueForm.address.trim(),
          postalcode: venueForm.postalcode.trim(),
          city: venueForm.city.trim(),
          website: venueForm.website.trim() || null,
        });

        const createdVenue = createdVenues?.[0];

        if (!createdVenue?.id) {
          throw new Error("The new venue was created without an id.");
        }

        venueId = createdVenue.id;
        setVenues((currentVenues) =>
          [...currentVenues, createdVenue].sort((a, b) =>
            a.name.localeCompare(b.name, "da"),
          ),
        );
      }

      await supabaseInsert("events", {
        title: form.title.trim(),
        category: form.category.trim(),
        date: new Date(form.date).toISOString(),
        price: Number(form.price),
        capacity: Number(form.capacity),
        venueId: Number(venueId),
        image: form.image.trim(),
        summary: form.summary.trim(),
        description: form.description.trim(),
      });

      setForm(initialForm);
      setVenueForm(initialVenueForm);
      setMessage("Eventet er nu oprettet.");
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Eventet kunne ikke oprettes. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <header className="admin-header">
        <p className="eyebrow">For arrangører</p>
        <h1 ref={headingRef} tabIndex={-1}>
          Tilføj event
        </h1>
        <p>Opret et nyt event på Mellemrum.</p>
      </header>

      <main className="event-form-page">
        <section className="event-form-panel">
          <div className="event-form-intro">
            <p className="eyebrow dark">Nyt event</p>
            <h2>Eventoplysninger</h2>
            <p>
              Udfyld formularen. Eventet bliver synligt på forsiden, når det er
              oprettet.
            </p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="success-message" role="status">
              <p>{message}</p>
            </div>
          )}

          <form className="event-form" onSubmit={handleSubmit}>
            <div className="event-form-grid">
              <label>
                Titel
                <input
                  name="title"
                  type="text"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Eventets titel"
                  required
                />
              </label>

              <label>
                Kategori
                <input
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Fx koncert, talk eller workshop"
                  required
                />
              </label>

              <label>
                Dato og tidspunkt
                <input
                  name="date"
                  type="datetime-local"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Venue
                <select
                  name="venueId"
                  value={form.venueId}
                  onChange={handleChange}
                  disabled={isLoadingVenues}
                  required
                >
                  <option value="">
                    {isLoadingVenues ? "Henter venues..." : "Vælg venue"}
                  </option>

                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}

                  <option value={NEW_VENUE_VALUE}>+ Opret ny lokation</option>
                </select>
              </label>

              {form.venueId === NEW_VENUE_VALUE && (
                <fieldset className="new-venue-fields event-form-full-width">
                  <legend>Ny lokation</legend>

                  <div className="new-venue-grid">
                    <label>
                      Navn på lokation
                      <input
                        name="name"
                        type="text"
                        value={venueForm.name}
                        onChange={handleVenueChange}
                        placeholder="Fx Godsbanen"
                        required
                      />
                    </label>

                    <label>
                      Adresse
                      <input
                        name="address"
                        type="text"
                        value={venueForm.address}
                        onChange={handleVenueChange}
                        placeholder="Fx Skovgaardsgade 3"
                        required
                      />
                    </label>

                    <label>
                      Postnummer
                      <input
                        name="postalcode"
                        type="text"
                        inputMode="numeric"
                        value={venueForm.postalcode}
                        onChange={handleVenueChange}
                        placeholder="Fx 8000"
                        required
                      />
                    </label>

                    <label>
                      By
                      <input
                        name="city"
                        type="text"
                        value={venueForm.city}
                        onChange={handleVenueChange}
                        placeholder="Fx Aarhus C"
                        required
                      />
                    </label>

                    <label className="event-form-full-width">
                      Hjemmeside (valgfri)
                      <input
                        name="website"
                        type="url"
                        value={venueForm.website}
                        onChange={handleVenueChange}
                        placeholder="https://..."
                      />
                    </label>
                  </div>
                </fieldset>
              )}

              <label>
                Pris i kroner
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
              </label>

              <label>
                Antal pladser
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={form.capacity}
                  onChange={handleChange}
                  placeholder="Fx 50"
                  required
                />
              </label>

              <label className="event-form-full-width">
                Billedlink
                <input
                  name="image"
                  type="url"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </label>

              <label className="event-form-full-width">
                Kort beskrivelse
                <textarea
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  placeholder="En kort introduktion til eventet"
                  rows="3"
                  required
                />
              </label>

              <label className="event-form-full-width">
                Fuld beskrivelse
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Fortæl mere om eventet"
                  rows="7"
                  required
                />
              </label>
            </div>

            <button
              className="event-form-submit"
              type="submit"
              disabled={isSubmitting || isLoadingVenues}
            >
              {isSubmitting ? "Opretter event..." : "Opret event"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}

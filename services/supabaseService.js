const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_APIKEY = import.meta.env.VITE_SUPABASE_APIKEY;

const headers = {
  apikey: SUPABASE_APIKEY,
  Authorization: `Bearer ${SUPABASE_APIKEY}`,
  "Content-Type": "application/json",
};

export async function supabaseFetch(endpoint) {
  const response = await fetch(`${SUPABASE_URL}/${endpoint}`, {
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function supabaseInsert(endpoint, data) {
  const response = await fetch(`${SUPABASE_URL}/${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }
}

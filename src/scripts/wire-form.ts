/**
 * Validates a website form, sends it to /api/form (which files it in Wix Forms),
 * and swaps in the thank-you message on success.
 */
type Options = {
  form: HTMLFormElement | null;
  key: "quote" | "contact";
  success: HTMLElement | null;
  error: HTMLElement | null;
  /** input name on the page → field key in Wix Forms, where they differ */
  rename?: Record<string, string>;
  /** shown if sending fails, so nobody's request is silently lost */
  fallback: string;
};

export function wireForm({ form, key, success, error, rename = {}, fallback }: Options) {
  if (!form) return;
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const showError = (msg: string) => {
    if (!error) return;
    error.textContent = msg;
    error.style.display = "block";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((el) => {
      if (el.name === "website") return;
      const empty = el.value.trim() === "";
      const ok = el.required ? el.checkValidity() && !empty : empty || el.checkValidity();
      el.closest(".field")?.classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      showError("Please fill in the required fields.");
      form.querySelector<HTMLElement>(".is-invalid input, .is-invalid select, .is-invalid textarea")?.focus();
      return;
    }

    const body: Record<string, string> = { form: key };
    new FormData(form).forEach((v, k) => (body[rename[k] ?? k] = String(v)));

    if (error) error.style.display = "none";
    if (button) {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    }
    try {
      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (res.status === 422 && Array.isArray(data.fields)) {
          for (const f of data.fields as string[]) {
            const name = Object.keys(rename).find((k) => rename[k] === f) ?? f;
            form.querySelector(`[name="${name}"]`)?.closest(".field")?.classList.add("is-invalid");
          }
          showError(data.fields.includes("phone") ? "Please check your phone number." : "Please check the highlighted fields.");
        } else {
          showError(fallback);
        }
        return;
      }
      form.classList.add("is-sent");
      success?.classList.add("is-visible");
      success?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch {
      showError(fallback);
    } finally {
      if (button) {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    }
  });
}

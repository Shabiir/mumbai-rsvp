(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const state = { code: "", guest: null };
  const apiUrl = window.RSVP_CONFIG && window.RSVP_CONFIG.apiUrl;

  function setStatus(message, isError = false) {
    $("status").textContent = message;
    $("status").classList.toggle("error", isError);
  }

  function validConfig() {
    if (!apiUrl || !/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(apiUrl)) {
      setStatus("The RSVP service has not been connected yet.", true);
      return false;
    }
    return true;
  }

  function jsonp(params, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const callback = `rsvp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement("script");
      const timer = setTimeout(() => finish(new Error("The RSVP service did not respond.")), timeout);
      function finish(error, data) {
        clearTimeout(timer); delete window[callback]; script.remove();
        error ? reject(error) : resolve(data);
      }
      window[callback] = (data) => finish(null, data);
      const query = new URLSearchParams({ ...params, callback });
      script.src = `${apiUrl}?${query}`;
      script.onerror = () => finish(new Error("Unable to reach the RSVP service."));
      document.head.appendChild(script);
    });
  }

  async function lookup(silent = false) {
    const code = $("inviteCode").value.trim();
    if (!/^\d{4}$/.test(code)) return setStatus("Please enter exactly four digits.", true);
    if (!validConfig()) return;
    if (!silent) { setStatus("Finding your invitation..."); $("lookupButton").disabled = true; }
    try {
      const result = await jsonp({ action: "lookup", code, _: Date.now() });
      if (!result.ok) throw new Error(result.error || "We could not find that invitation.");
      state.code = code; state.guest = result.guest;
      renderGuest(result.guest);
      $("lookupView").classList.add("hidden"); $("rsvpForm").classList.remove("hidden");
      setStatus("");
    } catch (error) { setStatus(error.message, true); }
    finally { $("lookupButton").disabled = false; }
  }

  function renderGuest(guest) {
    const max = Number(guest.maximumInvites) || 1;
    $("greeting").textContent = `Welcome, ${guest.greetingName}`;
    $("allocation").textContent = `This invitation is for up to ${max} guest${max === 1 ? "" : "s"}.`;
    $("attendeeCount").innerHTML = Array.from({length:max},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join("");
    const prior = guest.existingRsvp;
    if (prior) {
      const attendance = document.querySelector(`[name="attendance"][value="${prior.attendance}"]`);
      if (attendance) attendance.checked = true;
      $("message").value = prior.message || "";
      if (prior.attendance === "Accept") {
        $("attendingFields").classList.remove("hidden");
        $("attendeeCount").value = String(Math.max(1, prior.attendees.length));
        renderGuestFields(prior.attendees);
      }
    }
  }

  function renderGuestFields(existing = []) {
    const count = Number($("attendeeCount").value);
    const current = [...document.querySelectorAll(".guest")].map((el) => ({name:el.querySelector(".guest-name").value,meal:el.querySelector(".meal").value}));
    const values = existing.length ? existing : current;
    $("guestFields").innerHTML = Array.from({length:count},(_,i) => {
      const person = values[i] || {};
      return `<div class="guest"><div class="guest-grid"><label>Guest ${i+1} name<input class="guest-name" maxlength="100" value="${escapeHtml(person.name || "")}" required></label><label>Meal<select class="meal"><option value="Vegetarian" ${person.meal === "Vegetarian" ? "selected" : ""}>Vegetarian</option><option value="Non-Vegetarian" ${person.meal === "Non-Vegetarian" ? "selected" : ""}>Non-Vegetarian</option></select></label></div></div>`;
    }).join("");
  }

  function escapeHtml(value) { const d=document.createElement("div"); d.textContent=value; return d.innerHTML; }

  async function submit(event) {
    event.preventDefault();
    const attendance = new FormData(event.currentTarget).get("attendance");
    if (!attendance) return setStatus("Please select accept or decline.", true);
    const attendees = attendance === "Accept" ? [...document.querySelectorAll(".guest")].map((el) => ({name:el.querySelector(".guest-name").value.trim(),meal:el.querySelector(".meal").value})) : [];
    if (attendees.some((person) => !person.name)) return setStatus("Please enter every attending guest's name.", true);
    const payload = { code:state.code, attendance, attendees, message:$("message").value.trim(), submissionId:`${Date.now()}-${Math.random().toString(36).slice(2)}` };
    $("submitButton").disabled = true; setStatus("Saving your RSVP...");
    try {
      const body = new URLSearchParams({ action:"save", payload:JSON.stringify(payload) });
      await fetch(apiUrl, { method:"POST", mode:"no-cors", headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"}, body });
      let confirmed = false;
      for (let attempt=0; attempt<4 && !confirmed; attempt++) {
        await new Promise((r) => setTimeout(r, 900 + attempt * 500));
        const check = await jsonp({ action:"lookup", code:state.code, _:Date.now() });
        confirmed = Boolean(check.ok && check.guest.existingRsvp && check.guest.existingRsvp.submissionId === payload.submissionId);
      }
      if (!confirmed) throw new Error("We could not confirm the save. Please try once more.");
      $("rsvpForm").innerHTML = `<h2>Thank you</h2><p class="status">Your RSVP has been received. Mustafa &amp; Tina and the Shikora Family look forward to celebrating with you.</p>`;
      setStatus("");
    } catch (error) { setStatus(error.message, true); $("submitButton").disabled = false; }
  }

  $("beginButton").addEventListener("click", () => { $("landing").classList.add("hidden"); $("rsvp").classList.remove("hidden"); $("inviteCode").focus(); });
  $("backButton").addEventListener("click", () => { $("rsvp").classList.add("hidden"); $("landing").classList.remove("hidden"); });
  $("lookupButton").addEventListener("click", () => lookup());
  $("inviteCode").addEventListener("keydown", (e) => { if (e.key === "Enter") lookup(); });
  document.querySelectorAll('[name="attendance"]').forEach((radio) => radio.addEventListener("change", (e) => { $("attendingFields").classList.toggle("hidden", e.target.value !== "Accept"); if (e.target.value === "Accept") renderGuestFields(); }));
  $("attendeeCount").addEventListener("change", () => renderGuestFields());
  $("rsvpForm").addEventListener("submit", submit);
  const personalizedCode = new URLSearchParams(location.search).get("code");
  if (/^\d{4}$/.test(personalizedCode || "")) { $("inviteCode").value = personalizedCode; }
})();

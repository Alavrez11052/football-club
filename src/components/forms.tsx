"use client";

import { useFormState } from "react-dom";
import { submitApplication, submitInquiry, type FormState } from "@/lib/actions/public";

const initial: FormState = {};

export function ApplicationForm({ type }: { type: "PLAYER" | "COACH" }) {
  const [state, action] = useFormState(submitApplication, initial);
  if (state.ok) {
    return (
      <div className="card border-green-200 bg-green-50 text-center">
        <h3 className="font-display text-xl font-bold text-green-900">Application received</h3>
        <p className="mt-2 text-sm text-green-800">
          Thank you — your {type === "PLAYER" ? "player" : "coaching"} application has been stored for review by the club&apos;s
          ownership team. Applying does not register you with the club; if your application is approved, the club will add you and be in touch.
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fullName">Full name *</label>
          <input className="input" id="fullName" name="fullName" required />
        </div>
        <div>
          <label className="label" htmlFor="dateOfBirth">Date of birth {type === "PLAYER" ? "*" : ""}</label>
          <input className="input" id="dateOfBirth" name="dateOfBirth" type="date" required={type === "PLAYER"} />
        </div>
        <div>
          <label className="label" htmlFor="email">Email *</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" type="tel" />
        </div>
        {type === "PLAYER" ? (
          <div>
            <label className="label" htmlFor="preferredPosition">Preferred position</label>
            <input className="input" id="preferredPosition" name="preferredPosition" placeholder="e.g. Central midfielder" />
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="desiredRole">Role you are applying for</label>
            <input className="input" id="desiredRole" name="desiredRole" placeholder="e.g. Head Coach, Assistant Coach" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="previousClubs">Previous clubs (if any)</label>
          <input className="input" id="previousClubs" name="previousClubs" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="experience">Football experience</label>
        <textarea className="input" id="experience" name="experience" rows={3} placeholder="Tell us about your playing or coaching background." />
      </div>
      {type === "COACH" ? (
        <div>
          <label className="label" htmlFor="qualifications">Qualifications / coaching badges</label>
          <textarea className="input" id="qualifications" name="qualifications" rows={2} />
        </div>
      ) : null}
      <div>
        <label className="label" htmlFor="additionalInfo">Anything else we should know?</label>
        <textarea className="input" id="additionalInfo" name="additionalInfo" rows={3} />
      </div>
      {type === "PLAYER" ? (
        <fieldset className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <legend className="px-1 text-sm font-bold text-amber-900">Applicants under 18 — safeguarding</legend>
          <p className="text-sm text-amber-800">
            If the applicant is under 18, a parent or guardian must provide their details and consent below. Applications from
            under-18s cannot be accepted without this.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="guardianName">Parent/guardian name</label>
              <input className="input" id="guardianName" name="guardianName" />
            </div>
            <div>
              <label className="label" htmlFor="guardianEmail">Parent/guardian email</label>
              <input className="input" id="guardianEmail" name="guardianEmail" type="email" />
            </div>
          </div>
          <label className="mt-3 flex items-start gap-2 text-sm text-amber-900">
            <input type="checkbox" name="guardianConsent" className="mt-1" />
            I am the parent/guardian of this applicant and I consent to this application being submitted and reviewed by the club.
          </label>
        </fieldset>
      ) : null}
      {state.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" className="btn-primary w-full sm:w-auto">Submit application</button>
    </form>
  );
}

export function InquiryForm({ type }: { type: "GENERAL" | "SPONSORSHIP" }) {
  const [state, action] = useFormState(submitInquiry, initial);
  if (state.ok) {
    return (
      <div className="card border-green-200 bg-green-50 text-center">
        <h3 className="font-display text-xl font-bold text-green-900">Message sent</h3>
        <p className="mt-2 text-sm text-green-800">Thank you — your message has been passed to the club&apos;s ownership team.</p>
      </div>
    );
  }
  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="type" value={type} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`name-${type}`}>Your name *</label>
          <input className="input" id={`name-${type}`} name="name" required />
        </div>
        <div>
          <label className="label" htmlFor={`email-${type}`}>Email *</label>
          <input className="input" id={`email-${type}`} name="email" type="email" required />
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`subject-${type}`}>Subject</label>
        <input className="input" id={`subject-${type}`} name="subject" />
      </div>
      <div>
        <label className="label" htmlFor={`message-${type}`}>Message *</label>
        <textarea className="input" id={`message-${type}`} name="message" rows={4} required />
      </div>
      {state.error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p> : null}
      <button type="submit" className="btn-primary">Send message</button>
    </form>
  );
}

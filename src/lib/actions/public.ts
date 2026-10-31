"use server";

import { z } from "zod";
import { db } from "../db";
import { ageFromDob } from "../club";

const applicationSchema = z.object({
  type: z.enum(["PLAYER", "COACH"]),
  fullName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().optional().default(""),
  dateOfBirth: z.string().optional().default(""),
  preferredPosition: z.string().optional().default(""),
  desiredRole: z.string().optional().default(""),
  experience: z.string().optional().default(""),
  previousClubs: z.string().optional().default(""),
  qualifications: z.string().optional().default(""),
  additionalInfo: z.string().optional().default(""),
  guardianName: z.string().optional().default(""),
  guardianEmail: z.string().optional().default(""),
  guardianConsent: z.boolean().optional().default(false),
});

export type FormState = { ok?: boolean; error?: string };

export async function submitApplication(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = applicationSchema.safeParse({
    type: formData.get("type"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    dateOfBirth: formData.get("dateOfBirth") ?? "",
    preferredPosition: formData.get("preferredPosition") ?? "",
    desiredRole: formData.get("desiredRole") ?? "",
    experience: formData.get("experience") ?? "",
    previousClubs: formData.get("previousClubs") ?? "",
    qualifications: formData.get("qualifications") ?? "",
    additionalInfo: formData.get("additionalInfo") ?? "",
    guardianName: formData.get("guardianName") ?? "",
    guardianEmail: formData.get("guardianEmail") ?? "",
    guardianConsent: formData.get("guardianConsent") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const d = parsed.data;

  const dob = d.dateOfBirth ? new Date(d.dateOfBirth) : null;
  if (dob && isNaN(dob.getTime())) return { error: "Please enter a valid date of birth." };

  // Safeguarding: applicants under 18 need a named guardian who has consented.
  const age = ageFromDob(dob);
  if (d.type === "PLAYER" && age !== null && age < 18) {
    if (!d.guardianName.trim() || !d.guardianEmail.trim()) {
      return { error: "Applicants under 18 must provide a parent/guardian name and email." };
    }
    if (!d.guardianConsent) {
      return { error: "Parent/guardian consent is required for applicants under 18." };
    }
  }

  await db.application.create({
    data: {
      type: d.type,
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      dateOfBirth: dob,
      preferredPosition: d.preferredPosition,
      desiredRole: d.desiredRole,
      experience: d.experience,
      previousClubs: d.previousClubs,
      qualifications: d.qualifications,
      additionalInfo: d.additionalInfo,
      guardianName: d.guardianName,
      guardianEmail: d.guardianEmail,
      guardianConsent: d.guardianConsent,
    },
  });
  return { ok: true };
}

const inquirySchema = z.object({
  type: z.enum(["GENERAL", "SPONSORSHIP"]),
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  subject: z.string().optional().default(""),
  message: z.string().min(5, "Please write a message."),
});

export async function submitInquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = inquirySchema.safeParse({
    type: formData.get("type") ?? "GENERAL",
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  await db.inquiry.create({ data: parsed.data });
  return { ok: true };
}

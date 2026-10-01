// Placeholder certifications — replace with your real ones.
// Keep names obviously generic until swapped for the real thing, so an
// un-edited placeholder never reads as a real (false) credential claim.

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  dateEarned: string;
  verifyUrl?: string;
};

export const certifications: Certification[] = [
  {
    id: "certification-alpha",
    title: "Certification Alpha",
    issuer: "Issuing Organization Alpha",
    dateEarned: "20XX",
    verifyUrl: "https://example.com/verify/certification-alpha",
  },
  {
    id: "certification-beta",
    title: "Certification Beta",
    issuer: "Issuing Organization Beta",
    dateEarned: "20XX",
  },
];

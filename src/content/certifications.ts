export type Certification = {
  id: string;
  title: string;
  issuer: string;
  dateEarned: string;
  verifyUrl?: string;
};

// Add real certifications here; the Credentials grid on /about stays hidden while this is empty.
export const certifications: Certification[] = [];

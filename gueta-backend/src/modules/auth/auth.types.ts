export interface PublicUser {
  id: string;
  email: string;
  name: string;
  provider: "password" | "google";
  onboarded: boolean;
}

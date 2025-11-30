export interface User {
  id: string;
  name: string;
  role: "lender" | "lendee";
}

export interface Item {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  isAvailable: boolean;
}

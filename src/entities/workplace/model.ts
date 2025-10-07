export interface Workplace {
  id: string;
  name: string;
  employees?: {
    id: string;
    name: string;
  }[];
}

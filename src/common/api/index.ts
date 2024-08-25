import Dramas from "../mocks/dramas.json";
type Data = Array<{ value: string; label: string }>;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchDramas = async (): Promise<Data> => {
  await delay(300);
  return Dramas;
};

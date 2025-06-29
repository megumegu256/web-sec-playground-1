import { Region } from "@prisma/client";

export const regionDisplayNames: Record<Region, string> = {
  [Region.OSAKA]: "大阪",
  [Region.TOKYO]: "東京",
  [Region.OKINAWA]: "沖縄",
};

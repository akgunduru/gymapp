import { GymMap } from "@/components/gyms/gym-map";
import { requireUser } from "@/lib/auth";

export default async function GymsPage() {
  await requireUser();

  return <GymMap />;
}

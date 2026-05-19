import {
  FITNESS_GOAL_LABELS,
  FITNESS_GOALS,
  FITNESS_LEVEL_LABELS,
  FITNESS_LEVELS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
  type FitnessGoalValue,
  type MuscleGroupValue,
} from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateProfileAction } from "@/lib/profile-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Save, Target, Utensils, UserRound } from "lucide-react";

type ProfilePageProps = {
  searchParams?: Promise<{
    updated?: string;
    error?: string;
  }>;
};

const fieldClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-500";

const textAreaClass =
  "min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const labelClass = "text-sm font-semibold text-slate-700";

function textValue(value: string | null | undefined) {
  return value ?? "";
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireUser();
  const params = await searchParams;
  const profileData = await db.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      email: true,
      role: true,
      profile: true,
      fitnessPreference: true,
      locations: {
        where: {
          isPrimary: true,
        },
        take: 1,
      },
    },
  });

  const profile = profileData?.profile;
  const preference = profileData?.fitnessPreference;
  const location = profileData?.locations[0];
  const selectedGoals = (preference?.goals ?? []) as string[];
  const selectedMuscleGroups = (preference?.preferredMuscleGroups ?? []) as string[];

  return (
    <div className="space-y-5">
      <section className="rounded-lg bg-slate-950 px-5 py-6 text-white sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Profile
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">Profile and preferences</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
              This information powers matching, workout recommendations, gym discovery, and
              nutrition goals in the next modules.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xs text-slate-400">Level</p>
              <p className="mt-1 font-semibold">
                {FITNESS_LEVEL_LABELS[(preference?.level ?? "BEGINNER") as keyof typeof FITNESS_LEVEL_LABELS]}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xs text-slate-400">City</p>
              <p className="mt-1 font-semibold">{profile?.city ?? location?.city ?? "Not set"}</p>
            </div>
          </div>
        </div>
      </section>

      {params?.updated ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Profile updated successfully.
        </div>
      ) : null}

      {params?.error ? (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          {params.error}
        </div>
      ) : null}

      <form action={updateProfileAction} className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
                  <UserRound className="h-5 w-5" />
                </div>
                <CardTitle>Basic information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 pt-0 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="fullName" className={labelClass}>
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile?.fullName ?? user.fullName ?? ""}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="bio" className={labelClass}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={textValue(profile?.bio)}
                  className={textAreaClass}
                  placeholder="Training habits, goals, schedule, or anything useful for matches."
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Email</label>
                <input
                  value={profileData?.email ?? user.email}
                  className={fieldClass}
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Role</label>
                <input
                  value={profileData?.role ?? user.role}
                  className={fieldClass}
                  readOnly
                  disabled
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-50 text-orange-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <CardTitle>Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 pt-0 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  defaultValue={profile?.city ?? location?.city ?? ""}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="district" className={labelClass}>
                  District
                </label>
                <input
                  id="district"
                  name="district"
                  defaultValue={profile?.district ?? location?.district ?? ""}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="address" className={labelClass}>
                  Address note
                </label>
                <input
                  id="address"
                  name="address"
                  defaultValue={textValue(location?.address)}
                  className={fieldClass}
                  placeholder="Optional, kept private for now."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="latitude" className={labelClass}>
                  Latitude
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  defaultValue={location?.latitude ?? 41.0435}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="longitude" className={labelClass}>
                  Longitude
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  defaultValue={location?.longitude ?? 29.0042}
                  className={fieldClass}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                  <Target className="h-5 w-5" />
                </div>
                <CardTitle>Fitness preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-5 pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="level" className={labelClass}>
                    Fitness level
                  </label>
                  <select
                    id="level"
                    name="level"
                    defaultValue={preference?.level ?? "BEGINNER"}
                    className={fieldClass}
                  >
                    {FITNESS_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {FITNESS_LEVEL_LABELS[level]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="weeklyWorkoutDays" className={labelClass}>
                    Weekly workout days
                  </label>
                  <input
                    id="weeklyWorkoutDays"
                    name="weeklyWorkoutDays"
                    type="number"
                    min={1}
                    max={7}
                    defaultValue={preference?.weeklyWorkoutDays ?? 3}
                    className={fieldClass}
                    required
                  />
                </div>
              </div>

              <fieldset className="space-y-2">
                <legend className={labelClass}>Goals</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {FITNESS_GOALS.map((goal) => (
                    <label
                      key={goal}
                      className="check-tile flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      <input
                        name="goals"
                        type="checkbox"
                        value={goal}
                        defaultChecked={selectedGoals.includes(goal)}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      {FITNESS_GOAL_LABELS[goal as FitnessGoalValue]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="space-y-2">
                <legend className={labelClass}>Preferred muscle groups</legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {MUSCLE_GROUPS.map((group) => (
                    <label
                      key={group}
                      className="check-tile flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      <input
                        name="preferredMuscleGroups"
                        type="checkbox"
                        value={group}
                        defaultChecked={selectedMuscleGroups.includes(group)}
                        className="h-4 w-4 accent-emerald-600"
                      />
                      {MUSCLE_GROUP_LABELS[group as MuscleGroupValue]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
                  <Utensils className="h-5 w-5" />
                </div>
                <CardTitle>Nutrition goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5 pt-0">
              <div className="space-y-2">
                <label htmlFor="dailyCalorieGoal" className={labelClass}>
                  Calories
                </label>
                <input
                  id="dailyCalorieGoal"
                  name="dailyCalorieGoal"
                  type="number"
                  defaultValue={preference?.dailyCalorieGoal ?? 2200}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dailyProteinGoal" className={labelClass}>
                  Protein
                </label>
                <input
                  id="dailyProteinGoal"
                  name="dailyProteinGoal"
                  type="number"
                  defaultValue={preference?.dailyProteinGoal ?? 120}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dailyCarbGoal" className={labelClass}>
                  Carbs
                </label>
                <input
                  id="dailyCarbGoal"
                  name="dailyCarbGoal"
                  type="number"
                  defaultValue={preference?.dailyCarbGoal ?? 250}
                  className={fieldClass}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dailyFatGoal" className={labelClass}>
                  Fat
                </label>
                <input
                  id="dailyFatGoal"
                  name="dailyFatGoal"
                  type="number"
                  defaultValue={preference?.dailyFatGoal ?? 70}
                  className={fieldClass}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="sticky top-24 border-emerald-200 bg-emerald-50">
            <CardHeader className="p-5">
              <CardTitle className="text-lg">Ready for next modules</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-sm leading-6 text-emerald-900">
                After this profile is saved, gym discovery can use your city and location,
                matching can use your goals, workouts can use your level, and nutrition can
                use your calorie/macro targets.
              </p>
              <Button type="submit" className="mt-4 w-full">
                <Save className="h-4 w-4" />
                Save profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

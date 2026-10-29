import type { Metadata } from "next";

import { loadJobDetails, loadProfile } from "@/lib/profile-data";
import { loadSettings } from "@/lib/settings-data";

import { ProfileEditor } from "./profile-editor";
import { sectionFromParam } from "./sections";

export const metadata: Metadata = { title: "Profile" };

/** The profile editor; the current section is in `?section=` (E4-1). */
export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const [{ section }, profile, jobDetails, settings] = await Promise.all([searchParams, loadProfile(), loadJobDetails(), loadSettings()]);
  return (
    <ProfileEditor
      initial={profile}
      initialJobDetails={jobDetails}
      section={sectionFromParam(section)}
      order={{ experience: settings.experienceOrder, projects: settings.projectOrder, education: settings.educationOrder }}
    />
  );
}

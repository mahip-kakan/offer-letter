import type { Metadata } from "next";

import { naukriHeadline, naukriRefreshDue, naukriSkills, naukriSummary } from "@/lib/naukri";
import { loadJobDetails, loadProfile } from "@/lib/profile-data";
import { prisma } from "@/lib/prisma";
import { loadSettings } from "@/lib/settings-data";

import { ProfileEditor } from "./profile-editor";
import { sectionFromParam } from "./sections";

export const metadata: Metadata = { title: "Profile" };

/** The profile editor; the current section is in `?section=` (E4-1). */
export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const [{ section }, profile, jobDetails, settings, refreshed] = await Promise.all([
    searchParams,
    loadProfile(),
    loadJobDetails(),
    loadSettings(),
    prisma.profileField.findUnique({ where: { key: "naukri.refreshedAt" } }),
  ]);
  const refreshedAt = refreshed?.value ?? null;
  return (
    <ProfileEditor
      initial={profile}
      initialJobDetails={jobDetails}
      naukri={{
        headline: naukriHeadline(profile),
        summary: naukriSummary(profile),
        skills: naukriSkills(profile),
        due: naukriRefreshDue(refreshedAt, new Date()),
        refreshedLabel: refreshedAt ?? "never",
      }}
      section={sectionFromParam(section)}
      order={{ experience: settings.experienceOrder, projects: settings.projectOrder, education: settings.educationOrder }}
    />
  );
}

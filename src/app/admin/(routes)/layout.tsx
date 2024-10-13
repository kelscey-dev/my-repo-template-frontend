import { cookies } from "next/headers";

import { AuthProfileType } from "@app-types/GlobalTypes";

import AdminProvider from "@context/AdminProvider";

import AdminLayout from "./_components/AdminLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileData = cookies().get("x-profile-data")?.value;

  const profile: AuthProfileType = await JSON.parse(profileData as string);

  return (
    <AdminProvider profile={profile}>
      <AdminLayout>{children}</AdminLayout>
    </AdminProvider>
  );
}

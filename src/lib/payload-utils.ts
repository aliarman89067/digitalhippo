import { User } from "../payload-types";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest } from "next/server";

export const getServerSideUser = async (
  cookie: NextRequest["cookies"] | ReadonlyRequestCookies
) => {
  const token = cookie.get("payload-token")?.value;

  const resMe = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`,
    {
      headers: {
        Authorization: `JWT ${token}`,
      },
    }
  );
  const { user } = (await resMe.json()) as { user: User | null };
  return { user };
};
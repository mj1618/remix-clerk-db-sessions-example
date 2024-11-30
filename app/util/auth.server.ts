import { createClerkClient } from "@clerk/remix/api.server";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { db } from "~/db/kysely";
import { User } from "~/db/types";
import { commitSession, getSession } from "~/util/sessions.server";

export const redirectIfAuthenticatedLoader = (
  loaderFunction: (args: LoaderFunctionArgs) => Promise<Response>
) => {
  return async (args: LoaderFunctionArgs) => {
    const { user, cookie } = await getUser(args);
    if (user) {
      return redirect("/dashboard");
    }

    const response = await loaderFunction(args);
    response.headers.set("Set-Cookie", cookie);
    return response;
  };
};

export const authenticatedLoader = (
  loaderFunction: (args: LoaderFunctionArgs, user: User) => Promise<Response>
) => {
  return async (args: LoaderFunctionArgs) => {
    console.log("authenticated loader");
    const { user, cookie } = await getUser(args);
    if (!user) {
      return redirect("/sign-in");
    }

    const response = await loaderFunction(args, user);
    response.headers.set("Set-Cookie", cookie);
    return response;
  };
};

export const authenticatedAction = (
  actionFunction: (args: ActionFunctionArgs, user: User) => Promise<Response>
) => {
  return async (args: ActionFunctionArgs) => {
    const { user, cookie } = await getUser(args);
    if (!user) {
      return redirect("/sign-in");
    }
    const response = await actionFunction(args, user);
    response.headers.set("Set-Cookie", cookie);
    return response;
  };
};

export const getUser = async (
  args: LoaderFunctionArgs | ActionFunctionArgs
): Promise<{ user: User | null; cookie: string }> => {
  const { userId: clerkUserId } = await getAuth(args);
  let userRecord: User | undefined;
  const session = await getSession(args.request.headers.get("Cookie"));

  if (!clerkUserId) {
    session.unset("user");
    return { user: null, cookie: await commitSession(session) };
  }

  if (session.has("user")) {
    return { user: session.get("user"), cookie: await commitSession(session) };
  }

  if (!clerkUserId) {
    return { user: null, cookie: await commitSession(session) };
  }

  const user = await createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  }).users.getUser(clerkUserId);

  userRecord = await db
    .selectFrom("users")
    .where("clerk_user_id", "=", clerkUserId)
    .selectAll()
    .executeTakeFirst();

  if (userRecord) {
    userRecord = await db
      .updateTable("users")
      .set({
        first_name: user.firstName ?? "",
        last_name: user.lastName ?? "",
        photo: user.imageUrl ?? "",
      })
      .where("id", "=", userRecord.id)
      .returningAll()
      .executeTakeFirstOrThrow();
  } else {
    userRecord = await db
      .insertInto("users")
      .values({
        clerk_user_id: clerkUserId,
        email: user.emailAddresses[0].emailAddress,
        first_name: user.firstName ?? "",
        last_name: user.lastName ?? "",
        photo: user.imageUrl ?? "",
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  session.set("user", userRecord);
  return { user: userRecord, cookie: await commitSession(session) };
};

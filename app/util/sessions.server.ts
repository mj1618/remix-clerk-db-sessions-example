import {
  Cookie,
  CookieOptions,
  createCookie,
  createSessionStorage,
} from "@remix-run/node"; // or cloudflare/deno
import moment from "moment";
import { db } from "~/db/kysely";
const createDatabaseSessionStorage = ({
  cookie,
}: {
  cookie: Cookie | (CookieOptions & { name: string });
}) => {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      console.log("create data", data);
      const { id } = await db
        .insertInto("sessions")
        .values({
          id: crypto.randomUUID(),
          data,
          expires:
            expires?.toISOString() ?? moment().add(1, "week").toISOString(),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      return id.toString();
    },
    async readData(id) {
      const row = await db
        .selectFrom("sessions")
        .where("id", "=", id)
        .selectAll()
        .executeTakeFirst();
      return row ? row.data : null;
    },
    async updateData(id, data, expires) {
      const hasRow = await db
        .selectFrom("sessions")
        .where("id", "=", id)
        .selectAll()
        .executeTakeFirst();
      if (!hasRow) {
        await db
          .insertInto("sessions")
          .values({
            id,
            data,
            expires:
              expires?.toISOString() ?? moment().add(1, "week").toISOString(),
          })
          .execute();
      } else {
        await db
          .updateTable("sessions")
          .set({
            data,
            expires:
              expires?.toISOString() ?? moment().add(1, "week").toISOString(),
          })
          .where("id", "=", id)
          .execute();
      }
    },
    async deleteData(id) {
      await db.deleteFrom("sessions").where("id", "=", id).execute();
    },
  });
};

export const assertNotNull = (value: string | undefined) => {
  if (!value) {
    throw new Error("Value is null");
  }
  return value;
};

// don't name this __session as it can conflict with clerk
const sessionCookie = createCookie("__my_session", {
  secrets: [assertNotNull(process.env.SESSION_SECRET)],
  sameSite: true,
});

export const { getSession, commitSession, destroySession } =
  createDatabaseSessionStorage({
    cookie: sessionCookie,
  });

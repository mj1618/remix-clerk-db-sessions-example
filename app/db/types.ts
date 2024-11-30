import { SessionData } from "@remix-run/node";
import {
  ColumnType,
  GeneratedAlways,
  Insertable,
  Selectable,
  Updateable,
} from "kysely";
import moment from "moment";

export interface Database {
  users: UsersTable;
  sessions: SessionsTable;
}

export interface UsersTable {
  id: GeneratedAlways<number>;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  photo: string;
  created_at: ColumnType<moment.Moment, never, never>;
  updated_at: ColumnType<moment.Moment, never, never>;
}

export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UserUpdate = Updateable<UsersTable>;

export interface SessionsTable {
  id: ColumnType<string, string, never>;
  data: SessionData;
  expires: ColumnType<moment.Moment, string, string>;
}

export type Session = Selectable<SessionsTable>;
export type NewSession = Insertable<SessionsTable>;
export type SessionUpdate = Updateable<SessionsTable>;

CREATE TABLE "users" (
	id bigserial primary key,
	clerk_user_id text unique,
	email text unique not null,
	first_name text not null,
	last_name text not null,
	photo text default '',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

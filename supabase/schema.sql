-- Solon — Week 1 schema. Run this in the Supabase SQL editor.
-- The site reads and writes with the service-role key from the server only,
-- so row level security is enabled with no public policies.

create table if not exists hostels (
	id            serial primary key,
	name          varchar(255) not null,
	area          varchar(100) not null,           -- 'Camp', 'Oluwo', 'Isolu'
	rent_price    numeric not null,                -- per session, in naira
	room_type     varchar(100) not null default 'Self-contained',
	description   text not null default '',
	amenities     text[] not null default '{}',
	walk_minutes  int,                             -- to the campus gate
	video_url     text,                            -- Mux / Cloudinary stream URL
	poster_url    text,
	agent_phone   varchar(20),                     -- never sent to the browser
	scout_id      int,
	verified_at   date,                            -- set when a scout has visited
	is_available  boolean not null default true,
	created_at    timestamptz not null default now()
);

create table if not exists bookings (
	id              serial primary key,
	reference       varchar(255) not null unique,  -- also the Paystack reference
	hostel_id       int not null references hostels(id),
	student_name    varchar(255) not null,
	student_phone   varchar(20) not null,
	student_email   varchar(255) not null,
	amount_paid     numeric not null default 0,
	status          varchar(50) not null default 'pending_payment'
		check (status in ('pending_payment', 'held', 'released', 'refunded')),
	plan            varchar(50) not null default 'full'
		check (plan in ('full', 'installment_requested')),
	matric_number   varchar(50),
	guarantor_name  varchar(255),
	guarantor_phone varchar(20),
	affiliate_tag   varchar(100),
	created_at      timestamptz not null default now()
);

create index if not exists bookings_hostel_id_idx on bookings (hostel_id);
create index if not exists bookings_affiliate_tag_idx on bookings (affiliate_tag);

-- A review needs a booking, so only students who actually paid can leave one.
create table if not exists reviews (
	id          serial primary key,
	booking_id  int not null unique references bookings(id),
	rating      int not null check (rating between 1 and 5),
	comment     text,
	created_at  timestamptz not null default now()
);

alter table hostels  enable row level security;
alter table bookings enable row level security;
alter table reviews  enable row level security;

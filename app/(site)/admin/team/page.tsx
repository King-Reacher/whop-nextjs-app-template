import type { Metadata } from "next";
import { AdminNav } from "@/components/admin-nav";
import { ConfirmButton } from "@/components/confirm-button";
import { isOwnerPhone, requireRole } from "@/lib/staff";
import { listStaff } from "@/lib/students";
import { addStaff, removeStaff } from "../actions";

export const metadata: Metadata = {
	title: "Team · Admin",
	robots: { index: false },
};

export default async function AdminTeamPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string; added?: string }>;
}) {
	const admin = await requireRole("admin", "/admin/team");
	const { error, added } = await searchParams;
	const staff = await listStaff();

	return (
		<>
			<AdminNav current="/admin/team" />
			<h1 className="display mt-8 text-3xl">Team</h1>
			<p className="mt-2 max-w-prose text-muted">
				Scouts can add rooms. Admins can also approve rooms, manage bookings and
				change this list. People sign in with their own phone number.
			</p>

			{error === "phone" && (
				<p role="alert" className="alert mt-5 max-w-xl">
					Enter a valid Nigerian phone number, like 0803 123 4567.
				</p>
			)}
			{added && (
				<output className="note mt-5 max-w-xl block">
					Added. They can sign in with that number now.
				</output>
			)}

			<form action={addStaff} className="panel mt-6 max-w-xl space-y-4 p-4">
				<div className="grid gap-3 sm:grid-cols-2">
					<label className="block text-sm font-medium">
						Phone number
						<input
							name="phone"
							type="tel"
							required
							placeholder="0803 123 4567"
							className="field"
						/>
					</label>
					<label className="block text-sm font-medium">
						Name
						<input name="name" maxLength={80} className="field" />
					</label>
				</div>
				<label className="block text-sm font-medium">
					Role
					<select name="role" defaultValue="scout" className="field">
						<option value="scout">Scout</option>
						<option value="admin">Admin</option>
					</select>
				</label>
				<button type="submit" className="btn btn-primary !py-2.5 text-sm">
					Add to team
				</button>
			</form>

			{staff.length === 0 ? (
				<p className="mt-6 text-sm text-muted">
					No one has been added yet. Owner numbers set in ADMIN_PHONES are
					always admins.
				</p>
			) : (
				<ul className="panel mt-6 max-w-xl divide-y divide-line">
					{staff.map((person) => (
						<li
							key={person.id}
							className="flex items-center justify-between gap-4 px-4 py-3"
						>
							<div>
								<p className="font-medium">
									{person.name ?? "No name"}
									{person.phone === admin.phone && (
										<span className="text-muted"> (you)</span>
									)}
								</p>
								<p className="text-sm text-muted">
									+{person.phone} ·{" "}
									{isOwnerPhone(person.phone) ? "Owner" : person.role}
								</p>
							</div>
							{person.phone !== admin.phone && !isOwnerPhone(person.phone) && (
								<form action={removeStaff.bind(null, person.phone)}>
									<ConfirmButton
										message={`Remove +${person.phone} from the team?`}
										className="btn btn-ghost !px-3 !py-1.5 text-xs"
									>
										Remove
									</ConfirmButton>
								</form>
							)}
						</li>
					))}
				</ul>
			)}
		</>
	);
}

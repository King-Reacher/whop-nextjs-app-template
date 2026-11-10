import { AREAS, ROOM_TYPES } from "@/lib/config";
import type { HostelAdmin } from "@/lib/hostels";
import { COMMON_AMENITIES, LISTING_ERRORS } from "@/lib/listing-input";
import { MAX_PHOTOS } from "@/lib/media";
import { LocationField } from "./location-field";
import { PhotoUploader } from "./photo-uploader";

const label = "block text-sm font-medium";

/**
 * The add or edit room form, shared by scouts and admins. Admins also get
 * the publishing controls.
 */
export function ListingForm({
	action,
	hostel,
	error,
	admin = false,
	submitLabel,
}: {
	action: (form: FormData) => Promise<void>;
	hostel?: HostelAdmin;
	error?: string;
	admin?: boolean;
	submitLabel: string;
}) {
	const known = hostel?.amenities.filter((a) => COMMON_AMENITIES.includes(a));
	const other = hostel?.amenities.filter((a) => !COMMON_AMENITIES.includes(a));

	return (
		<form action={action} className="space-y-5">
			{error && LISTING_ERRORS[error] && (
				<p role="alert" className="alert">
					{LISTING_ERRORS[error]}
				</p>
			)}

			<label className={label}>
				Name of the hostel or lodge
				<input
					name="name"
					required
					minLength={3}
					maxLength={120}
					defaultValue={hostel?.name}
					className="field"
				/>
			</label>

			<div className="grid grid-cols-2 gap-3">
				<label className={label}>
					Area
					<select
						name="area"
						required
						defaultValue={hostel?.area ?? ""}
						className="field"
					>
						<option value="" disabled>
							Choose
						</option>
						{AREAS.map((area) => (
							<option key={area}>{area}</option>
						))}
					</select>
				</label>
				<label className={label}>
					Room type
					<select
						name="room_type"
						required
						defaultValue={hostel?.room_type ?? ""}
						className="field"
					>
						<option value="" disabled>
							Choose
						</option>
						{ROOM_TYPES.map((type) => (
							<option key={type}>{type}</option>
						))}
					</select>
				</label>
				<label className={label}>
					Rent per session (₦)
					<input
						name="rent_price"
						required
						inputMode="numeric"
						placeholder="250000"
						pattern="[\d,\s]{5,10}"
						title="The rent for a full session in naira, for example 250000"
						defaultValue={hostel?.rent_price}
						className="field"
					/>
				</label>
				<label className={label}>
					Walk to campus (min)
					<input
						name="walk_minutes"
						inputMode="numeric"
						placeholder="15"
						pattern="\d{1,3}"
						title="Whole minutes, for example 15"
						defaultValue={hostel?.walk_minutes ?? ""}
						className="field"
					/>
				</label>
			</div>

			<label className={label}>
				Description
				<textarea
					name="description"
					rows={3}
					maxLength={600}
					placeholder="What the room is like: size, floor, bathroom, kitchen."
					defaultValue={hostel?.description}
					className="field"
				/>
			</label>

			<fieldset>
				<legend className={label}>What it has</legend>
				<div className="mt-2 flex flex-wrap gap-2">
					{COMMON_AMENITIES.map((amenity) => (
						<label
							key={amenity}
							className="chip cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-glow"
						>
							<input
								type="checkbox"
								name="amenities"
								value={amenity}
								defaultChecked={known?.includes(amenity)}
								className="sr-only"
							/>
							{amenity}
						</label>
					))}
				</div>
				<label className="mt-3 block text-xs font-medium text-muted">
					Anything else, separated by commas
					<input
						name="other_amenities"
						maxLength={200}
						defaultValue={other?.join(", ")}
						className="field"
					/>
				</label>
			</fieldset>

			<fieldset className="panel p-4">
				<legend className={`${label} px-1`}>Photos</legend>
				<PhotoUploader initial={hostel?.photos} max={MAX_PHOTOS} />
			</fieldset>

			<fieldset className="panel p-4">
				<legend className={`${label} px-1`}>Location on the map</legend>
				<LocationField lat={hostel?.lat ?? null} lng={hostel?.lng ?? null} />
			</fieldset>

			<label className={label}>
				Video link (optional)
				<input
					name="video_url"
					type="url"
					placeholder="https://"
					defaultValue={hostel?.video_url ?? ""}
					className="field"
				/>
				<span className="mt-1 block text-xs font-normal text-muted">
					Videos are large, so send the file on WhatsApp and paste the hosted
					link here when you have it.
				</span>
			</label>

			<label className={label}>
				Agent or landlord's phone
				<input
					name="agent_phone"
					type="tel"
					required={!admin}
					placeholder="0803 123 4567"
					pattern="[\d\s+\(\)\-]{11,17}"
					title="A Nigerian phone number, like 0803 123 4567"
					defaultValue={
						hostel?.agent_phone ? `0${hostel.agent_phone.slice(3)}` : ""
					}
					className="field"
				/>
				<span className="mt-1 block text-xs font-normal text-muted">
					Only staff see this. It is never shown to students.
				</span>
			</label>

			{admin ? (
				<fieldset className="panel space-y-4 p-4">
					<legend className={`${label} px-1`}>Publishing</legend>
					<label className={label}>
						Status
						<select
							name="status"
							defaultValue={hostel?.status ?? "live"}
							className="field"
						>
							<option value="live">Live: students can see it</option>
							<option value="pending">Pending review</option>
							<option value="rejected">Not accepted</option>
						</select>
					</label>
					<label className="flex items-start gap-3 text-sm">
						<input
							type="checkbox"
							name="verified"
							defaultChecked={hostel ? Boolean(hostel.verified_at) : true}
							className="mt-0.5 size-4 accent-brand"
						/>
						<span>
							<span className="font-medium">Verified</span>
							<span className="block text-muted">
								Someone from the team has visited this room in person.
							</span>
						</span>
					</label>
					<label className="flex items-start gap-3 text-sm">
						<input
							type="checkbox"
							name="is_available"
							defaultChecked={hostel?.is_available ?? true}
							className="mt-0.5 size-4 accent-brand"
						/>
						<span>
							<span className="font-medium">Available</span>
							<span className="block text-muted">
								Untick when the room has been taken.
							</span>
						</span>
					</label>
				</fieldset>
			) : (
				<label className="flex items-start gap-3 text-sm">
					<input
						type="checkbox"
						name="visited"
						required
						className="mt-0.5 size-4 accent-brand"
					/>
					<span>
						I visited this room in person and these are my own photos of it.
					</span>
				</label>
			)}

			<button type="submit" className="btn btn-primary w-full">
				{submitLabel}
			</button>
		</form>
	);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getHostel } from "@/lib/hostels";
import { currentStudent, endSession } from "@/lib/session";
import { saveRoom, unsaveRoom } from "@/lib/students";

/** Saves or removes a room. Sends signed-out students to sign in first. */
export async function toggleSaved(hostelId: number, saved: boolean) {
	const student = await currentStudent();
	if (!student) {
		redirect(`/sign-in?next=/hostels/${hostelId}&save=${hostelId}`);
	}
	if (!(await getHostel(hostelId))) return;

	if (saved) await unsaveRoom(student.id, hostelId);
	else await saveRoom(student.id, hostelId);
	revalidatePath(`/hostels/${hostelId}`);
	revalidatePath("/saved");
}

export async function signOut() {
	await endSession();
	redirect("/");
}

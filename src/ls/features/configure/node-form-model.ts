import { RIG_NODE_ROLES } from "../../../ls-contracts/rigs";
import type { RigNodePayload } from "../../lib/api/rigs";
import type { RigHardwareType, RigNode, RigNodeRole } from "../../lib/types";

export interface NodeFormState {
	name: string;
	hardware_type: RigHardwareType;
	role: RigNodeRole;
	hostname: string;
	address: string;
	memory_gb: string;
	accelerator_name: string;
	accelerator_count: string;
	accelerator_memory_gb: string;
	unified_memory: boolean;
	notes: string;
}

export function isRigNodeRole(value: string): value is RigNodeRole {
	return RIG_NODE_ROLES.some((role) => role === value);
}

export function nodeToForm(node: RigNode): NodeFormState {
	const accelerator = node.accelerators[0];
	return {
		name: node.name,
		hardware_type: node.hardware_type,
		role: node.role,
		hostname: node.hostname ?? "",
		address: node.address ?? "",
		memory_gb: node.memory_gb === null ? "" : String(node.memory_gb),
		accelerator_name: accelerator?.name ?? "",
		accelerator_count: String(accelerator?.count ?? 1),
		accelerator_memory_gb:
			accelerator?.memory_gb === null || accelerator?.memory_gb === undefined
				? ""
				: String(accelerator.memory_gb),
		unified_memory: accelerator?.unified_memory ?? false,
		notes: node.notes ?? "",
	};
}

export function formToPayload(
	form: NodeFormState,
): RigNodePayload & { name: string } {
	const acceleratorName = form.accelerator_name.trim();
	const acceleratorMemory = form.accelerator_memory_gb.trim();
	const accelerators: NonNullable<RigNodePayload["accelerators"]> = [];
	if (acceleratorName) {
		accelerators.push({
			name: acceleratorName,
			count: Math.max(1, Number(form.accelerator_count) || 1),
			memory_gb: acceleratorMemory ? Number(acceleratorMemory) : null,
			unified_memory: form.unified_memory,
		});
	}
	return {
		name: form.name.trim(),
		hardware_type: form.hardware_type,
		role: form.role,
		hostname: form.hostname.trim() || null,
		address: form.address.trim() || null,
		memory_gb: form.memory_gb.trim() ? Number(form.memory_gb) : null,
		accelerators,
		notes: form.notes.trim() || null,
	};
}

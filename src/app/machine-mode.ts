import { createContext, useContext } from "react";

function ignoreMachineToggle(next: boolean) {
	void next;
}

export const MachineContext = createContext({
	machineMode: false,
	toggleMachine: ignoreMachineToggle,
});

export function useMachine() {
	return useContext(MachineContext);
}

import { createContext, useContext } from "react";

export interface MachineState {
	machineMode: boolean;
	toggleMachine: (next: boolean) => void;
}

export const MachineContext = createContext<MachineState>({
	machineMode: false,
	toggleMachine: () => {},
});

export function useMachine(): MachineState {
	return useContext(MachineContext);
}

import { useRef, useState, type Dispatch } from "react";
import { DEMO_PROMPT, type DemoAction, type DemoState } from "../scenario/sequence";
import type { HeroTaskId } from "./projects-nav";
import type { ChatMessage } from "./hero-types";
import { FOLLOW_UP_REPLY, inboxMessages, demoSession } from "./hero-data";
type TaskText = Readonly<Record<HeroTaskId, string>>;
type TaskMessages = Readonly<Record<HeroTaskId, readonly ChatMessage[]>>;
type Draft = ReturnType<typeof useTaskDraft>;
function useTaskDraft(activeTask: HeroTaskId, dispatch: Dispatch<DemoAction>) {
	const [drafts, setDrafts] = useState<TaskText>({ weekend: "", inbox: "" });
	const [userEditing, setUserEditing] = useState(false);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	function takeComposer(next: string): void {
		if (activeTask === "weekend" && !userEditing) {
			setUserEditing(true);
			dispatch({ type: "pause" });
		}
		setDrafts((current) => ({ ...current, [activeTask]: next }));
	}
	return { drafts, setDrafts, userEditing, inputRef, takeComposer };
}
function useFollowUps(
	activeTask: HeroTaskId,
	composerValue: string,
	autoPrompt: boolean,
	setDrafts: Draft["setDrafts"],
) {
	const [followUps, setFollowUps] = useState<TaskMessages>({ weekend: [], inbox: [] });
	const extraId = useRef(0);
	function sendFollowUp(): void {
		const text = composerValue.trim();
		if (!text || autoPrompt) return;
		extraId.current += 1;
		const id = extraId.current;
		setFollowUps((current) => ({
			...current,
			[activeTask]: [
				...current[activeTask],
				{ id: `user-extra-${id}`, role: "user", text },
				{ id: `assistant-extra-${id}`, role: "assistant", text: FOLLOW_UP_REPLY },
			],
		}));
		setDrafts((current) => ({ ...current, [activeTask]: "" }));
	}
	return { extras: followUps[activeTask], sendFollowUp };
}
export function useHeroTasks(state: Readonly<DemoState>, dispatch: Dispatch<DemoAction>) {
	const [activeTask, setActiveTask] = useState<HeroTaskId>("weekend");
	const [titles, setTitles] = useState<TaskText>({
		weekend: "Maya's birthday weekend",
		inbox: "Monday family reset",
	});
	const draft = useTaskDraft(activeTask, dispatch);
	const weekendTask = activeTask === "weekend";
	const submitted = !weekendTask || (state.phase !== "select" && state.phase !== "prompt");
	const autoPrompt = weekendTask && !submitted && !draft.userEditing;
	const composerValue = autoPrompt
		? DEMO_PROMPT.slice(0, state.promptChars)
		: draft.drafts[activeTask];
	const followUps = useFollowUps(activeTask, composerValue, autoPrompt, draft.setDrafts);
	const title = titles[activeTask];
	const messages: readonly ChatMessage[] | null = weekendTask
		? null
		: [...inboxMessages, ...followUps.extras];
	const session = demoSession(state, submitted, activeTask, title, followUps.extras);
	function renameTask(next: string): void {
		const trimmed = next.trim();
		if (!trimmed) return;
		setTitles((current) => ({ ...current, [activeTask]: trimmed }));
	}
	return {
		activeTask,
		setActiveTask,
		titles,
		weekendTask,
		submitted,
		autoPrompt,
		composerValue,
		...followUps,
		title,
		messages,
		session,
		renameTask,
		inputRef: draft.inputRef,
		takeComposer: draft.takeComposer,
	};
}

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "localstudio_censor_api_urls";
const CHANGE_EVENT = "localstudio-api-url-censor-change";

function readCensorPreference(): boolean {
	if (typeof window === "undefined") return false;
	return window.localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribe(callback: () => void): () => void {
	window.addEventListener("storage", callback);
	window.addEventListener(CHANGE_EVENT, callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(CHANGE_EVENT, callback);
	};
}

export function useApiUrlCensored(): boolean {
	return useSyncExternalStore(subscribe, readCensorPreference, () => false);
}

export function setApiUrlCensored(censored: boolean): void {
	window.localStorage.setItem(STORAGE_KEY, String(censored));
	window.dispatchEvent(new Event(CHANGE_EVENT));
}

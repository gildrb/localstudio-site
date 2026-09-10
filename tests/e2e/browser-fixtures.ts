import type { APIRequestContext, BrowserContext, Page } from "@playwright/test";

type RequestFixture = Readonly<Omit<APIRequestContext, "tracing">> & {
	readonly tracing: Readonly<APIRequestContext["tracing"]>;
};

type PageResources =
	| "clock"
	| "coverage"
	| "keyboard"
	| "localStorage"
	| "mouse"
	| "screencast"
	| "sessionStorage"
	| "touchscreen";

type PageFixture = Readonly<Omit<Page, PageResources | "request">> & {
	readonly [Resource in PageResources]: Readonly<Page[Resource]>;
} & { readonly request: RequestFixture };

type ContextResources = "clock" | "credentials" | "debugger" | "tracing";

type ContextFixture = Readonly<Omit<BrowserContext, ContextResources | "request">> & {
	readonly [Resource in ContextResources]: Readonly<BrowserContext[Resource]>;
} & { readonly request: RequestFixture };

interface Fixtures {
	readonly page: PageFixture;
	readonly request: RequestFixture;
	readonly context: ContextFixture;
}

export type BrowserFixtures<Names extends keyof Fixtures = "page"> = Pick<Fixtures, Names>;

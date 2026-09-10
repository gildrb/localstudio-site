import type { writeParams } from "./params";
import type { renderAtmosphere } from "./passes/atmosphere-pass";

/** Read-only borrow of the shared scene uniform writer's exact output. */
export type IntroSceneParameters = {
	readonly [Key in keyof ReturnType<typeof writeParams>]: Readonly<
		ReturnType<typeof writeParams>[Key]
	>;
};

type AtmosphereLighting = NonNullable<ReturnType<typeof renderAtmosphere>>;

/** Prepared camera/light metadata is borrowed without changing the pass owner's fields. */
export type IntroAtmosphereLighting = {
	readonly [Key in keyof AtmosphereLighting]: Readonly<AtmosphereLighting[Key]>;
};

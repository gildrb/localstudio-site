import localStudioAscii from "../content/local-studio-ascii.txt?raw";
import { machineSections } from "../agent/machine";
import { routePaths } from "../domain/route";
import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";
import { useMachine } from "../app/machine-mode";

const sections = machineSections();

export function MachinePage() {
	const { toggleMachine } = useMachine();
	return (
		<PageShell>
			<div className="machine">
				<div className="machine__inner">
					<button
						className="machine__banner"
						type="button"
						onClick={() => toggleMachine(false)}
						aria-label="Back to Local Studio"
					>
						<pre>{localStudioAscii}</pre>
					</button>
					<p className="machine__title">
						<span translate="no">sybil solutions</span> /{" "}
						<span translate="no">local studio</span> :: machine-readable index
					</p>
					<p className="machine__note">
						dense plain-text index of the company, products, APIs, and discovery
						files. agents: prefer /llms.txt or Accept: text/markdown.
					</p>
					<nav className="machine__routes" aria-label="Site routes">
						{routePaths.map((route) => (
							<LocalLink href={route} key={route}>
								{route}
							</LocalLink>
						))}
					</nav>
					{sections.map(([name, lines]) => (
						<section className="machine__section" key={name}>
							<h2>── {name}</h2>
							<pre>{lines.join("\n")}</pre>
						</section>
					))}
					<p className="machine__end">:: end of index ::</p>
				</div>
			</div>
		</PageShell>
	);
}

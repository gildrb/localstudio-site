import localStudioAscii from "../content/local-studio-ascii.txt?raw";
import { machineSections, type MachineSection } from "../agent/catalog";
import { LocalLink } from "../components/LocalLink";
import { PageShell } from "../components/PageShell";
import { useMachine } from "../machine";

function routeLinesFrom(sections: readonly MachineSection[]): string[] {
	for (const [name, lines] of sections) {
		if (name === "ROUTES") return lines;
	}
	throw new Error("ROUTES");
}

const sections = machineSections();
const routeLines = routeLinesFrom(sections);

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
						{routeLines.map((line) => {
							const route = line.split(" ")[0];
							if (route === undefined) return null;
							return (
								<LocalLink href={route} key={route}>
									{route}
								</LocalLink>
							);
						})}
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

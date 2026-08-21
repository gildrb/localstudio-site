import { CtaPair } from "../components/Links";
import { MediaFrame } from "../components/MediaFrame";
import { PageIntro } from "../components/PageIntro";
import { PageShell } from "../components/PageShell";
import { productFeatures } from "../content/product-features";
import { frameSizes, heroSizes, responsiveSrcSet } from "../images";

const container =
	"mx-auto w-[min(1399px,calc(100%_-_48px))]";

export function ProductPage() {
	return (
		<PageShell>
			<PageIntro
				id="product-title"
				title="One place to run local AI"
				description={
					<>
						<span translate="no">Local Studio</span> is a local-first
						workstation for running, managing, and using self-hosted
						language-model backends on local or remote controllers.
					</>
				}
				actions={
					<CtaPair
						secondary={{ href: "/docs", label: "Read the docs" }}
					/>
				}
			/>
			<section
				className={`${container} pb-30`}
				aria-label="Product capabilities"
			>
				<MediaFrame
					className="mb-30"
					src="/images/workbench-browser-1300.png"
					srcSet={responsiveSrcSet("/images/workbench-browser.png")}
					sizes={heroSizes}
					alt="Local Studio Workbench showing a coding agent and integrated browser."
					width="5118"
					height="2800"
					fetchPriority="high"
				/>
				{productFeatures.map((section, index) => (
					<article
						className={`grid min-h-[720px] items-center gap-30 py-20 max-[900px]:min-h-0 max-[900px]:grid-cols-1 max-[900px]:gap-12 ${index % 2 ? "grid-cols-[minmax(0,1.28fr)_minmax(260px,.72fr)]" : "grid-cols-[minmax(260px,.72fr)_minmax(0,1.28fr)]"}`}
						key={section.productTitle}
					>
						<div
							className={
								index % 2 ? "order-2 max-[900px]:order-none" : undefined
							}
						>
							<h2>
								{section.productTitle}
							</h2>
							<p className="mt-6 max-w-md text-base/6 text-white/70">
								{section.productText}
							</p>
						</div>
						<MediaFrame
							className={index % 2 ? "order-1 max-[900px]:order-none" : ""}
							src={section.image}
							srcSet={responsiveSrcSet(section.image)}
							sizes={frameSizes}
							alt={section.alt}
							width="5118"
							height="2800"
							loading="lazy"
							decoding="async"
						/>
					</article>
				))}
			</section>
		</PageShell>
	);
}

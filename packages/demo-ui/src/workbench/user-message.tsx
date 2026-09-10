import { demoStyles } from "../styles/demo-root.styles.ts";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./user-message.styles.ts";
export function UserMessage({ message }: { readonly message: { readonly text: string } }) {
	return (
		<article {...stylex.props(demoStyles.reset, styles.article7)}>
			<div {...stylex.props(demoStyles.reset, demoStyles.chatMarkdown, styles.chatMarkdown)}>
				{message.text}
			</div>
		</article>
	);
}

export function UserMessage({
	message,
}: {
	message: { text: string };
}) {
	return (
		<article className="min-w-0">
			<div className="chat-markdown whitespace-pre-wrap">{message.text}</div>
		</article>
	);
}

// src/Tiptap.tsx
import { BubbleMenu, useEditor, EditorContent, type EditorOptions, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import PlaceHolderExtension from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import { Markdown } from 'tiptap-markdown';
import { Document } from '@tiptap/extension-document';
import { Button } from '@/components/ui/button';
import {
	BoldIcon,
	Code,
	ItalicIcon,
	Link,
	List,
	ListOrdered,
	Plus,
	Strikethrough,
	TextQuote,
	Underline,
} from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TiptapProps extends Partial<Omit<EditorOptions, 'extensions'>> {
	placeholder?: string;
	className?: string;
	editorClassName?: string;
}

const Tiptap = ({
	content,
	placeholder = 'Write something …',
	className,
	editorClassName,
	...editorOptions
}: TiptapProps) => {
	const editor = useEditor({
		...editorOptions,
		extensions: [
			PlaceHolderExtension.configure({ placeholder, showOnlyWhenEditable: true }),
			StarterKit,
			// Document.extend({
			// 	content: 'heading block+',
			// }),
			UnderlineExtension,
			LinkExtension.configure({
				openOnClick: false,
				autolink: true,
				defaultProtocol: 'https',
				protocols: ['http', 'https'],
				isAllowedUri: (url, ctx) => {
					try {
						// construct URL
						const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`);

						// use default validation
						if (!ctx.defaultValidate(parsedUrl.href)) {
							return false;
						}

						// disallowed protocols
						const disallowedProtocols = ['ftp', 'file', 'mailto'];
						const protocol = parsedUrl.protocol.replace(':', '');

						if (disallowedProtocols.includes(protocol)) {
							return false;
						}

						// only allow protocols specified in ctx.protocols
						const allowedProtocols = ctx.protocols.map((p) => (typeof p === 'string' ? p : p.scheme));

						if (!allowedProtocols.includes(protocol)) {
							return false;
						}

						// disallowed domains
						const disallowedDomains = ['example-phishing.com', 'malicious-site.net'];
						const domain = parsedUrl.hostname;

						if (disallowedDomains.includes(domain)) {
							return false;
						}

						// all checks have passed
						return true;
					} catch {
						return false;
					}
				},
				shouldAutoLink: (url) => {
					try {
						// construct URL
						const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`);

						// only auto-link if the domain is not in the disallowed list
						const disallowedDomains = ['example-no-autolink.com', 'another-no-autolink.com'];
						const domain = parsedUrl.hostname;

						return !disallowedDomains.includes(domain);
					} catch {
						return false;
					}
				},
			}),
			Markdown,
		],
		content: content,
		immediatelyRender: true,
		shouldRerenderOnTransaction: false,
		editorProps: {
			attributes: {
				class: cn('prose focus:outline-none [&_li]:my-0 w-full !max-w-none', editorClassName),
			},
		},
	});

	useEffect(() => {
		editor?.setOptions(editorOptions);
	}, [editorOptions]);

	const setLink = useCallback(() => {
		const previousUrl = editor?.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);

		// cancelled
		if (url === null) {
			return;
		}

		// empty
		if (url === '') {
			editor?.chain().focus().extendMarkRange('link').unsetLink().run();

			return;
		}

		// update link
		try {
			editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
		} catch (e) {
			alert((e as Error).message);
		}
	}, [editor]);

	const users = useEditorState({
		editor,
		selector: (ctx) => {
			if (!ctx.editor?.storage.collaborationCursor?.users) {
				return [];
			}
		},
	});

	if (!editor) return null;

	return (
		<div className='flex flex-1 flex-col overflow-hidden'>
			<div className={cn('flex-1 overflow-y-auto p-3', className)}>
				<EditorContent editor={editor} />

				{/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
			</div>

			{editor.isEditable && (
				<div
					className='sticky -bottom-[1px] z-10 flex items-center gap-1.5 py-1.5 border-t px-3'
					aria-orientation='horizontal'
					role='toolbar'
					style={
						{
							// borderTop: "1px solid transparent",
							// gap: "4px",
							// zIndex: 3,
							// alignItems: "center",
							// width: "auto",
							// paddingTop: "8px",
							// paddingBottom: "8px",
							// display: "flex",
							// bottom: "-1px",
							// position: "sticky",
							// margin: "8px 0px",
							// backgroundColor: "transparent",
						}
					}
				>
					<Button
						variant='ghost'
						size='smIcon'
					>
						<Plus />
						<span className='sr-only'>Insert an object</span>
					</Button>

					<div
						className='TextEditorFixedToolbar-divider'
						style={{
							borderLeft: '1px solid #edeae9',
							alignSelf: 'stretch',
							marginTop: '4px',
							marginBottom: '4px',
							marginLeft: '4px',
						}}
					/>

					<Button
						onClick={() => editor.chain().focus().toggleBold().run()}
						variant={editor.isActive('bold') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<BoldIcon />
						<span className='sr-only'>Toggle bold</span>
					</Button>

					<Button
						onClick={() => editor.chain().focus().toggleItalic().run()}
						variant={editor.isActive('italic') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<ItalicIcon />
						<span className='sr-only'>Toggle italic</span>
					</Button>

					<Button
						onClick={() => editor.chain().focus().toggleUnderline().run()}
						variant={editor.isActive('underline') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<Underline />
						<span className='sr-only'>Toggle underline</span>
					</Button>

					<Button
						onClick={() => editor.chain().focus().toggleStrike().run()}
						variant={editor.isActive('strike') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<Strikethrough />
						<span className='sr-only'>Toggle strikethrough</span>
					</Button>

					<Button
						onClick={() => editor.chain().focus().toggleBulletList().run()}
						variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<List />
						<span className='sr-only'>Toggle bullet list</span>
					</Button>

					<Button
						onClick={() => editor.chain().focus().toggleOrderedList().run()}
						variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<ListOrdered />
						<span className='sr-only'>Toggle numbered list</span>
					</Button>

					<Button
						onClick={() => editor.chain().focus().toggleBlockquote().run()}
						variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<TextQuote />
						<span className='sr-only'>Toggle blockquote</span>
					</Button>

					<Button
						onClick={setLink}
						variant={editor.isActive('link') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<Link />
						<span className='sr-only'>Toggle link</span>
					</Button>

					<div
						style={{
							borderLeft: '1px solid #edeae9',
							alignSelf: 'stretch',
							marginTop: '4px',
							marginBottom: '4px',
						}}
					/>

					<Button
						onClick={() => editor.chain().focus().toggleCode().run()}
						variant={editor.isActive('code') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<Code />
						<span className='sr-only'>Toggle code</span>
					</Button>

					<Button
						onClick={() => editor.chain().focus().toggleCodeBlock().run()}
						variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
						size='smIcon'
					>
						<svg
							className='Icon CodeBlockIcon HighlightSol HighlightSol--core'
							aria-hidden='true'
							focusable='false'
							viewBox='0 0 32 32'
							style={{
								flex: '0 0 auto',
								width: '16px',
								height: '16px',
								overflow: 'hidden',
							}}
						>
							<path d='M32 10v6a1 1 0 1 1-2 0v-6c0-2.206-1.794-4-4-4H6c-2.206 0-4 1.794-4 4v12c0 2.206 1.794 4 4 4h3a1 1 0 1 1 0 2H6c-3.309 0-6-2.691-6-6V10c0-3.309 2.691-6 6-6h20c3.309 0 6 2.691 6 6Zm-13.359 8.232a1 1 0 0 0-1.409.128l-5 6a1 1 0 0 0 0 1.28l5 6a1 1 0 0 0 1.538-1.28L14.303 25l4.467-5.36a1 1 0 0 0-.129-1.408Zm8.128.128a1 1 0 0 0-1.537 1.28L29.699 25l-4.467 5.36a1 1 0 1 0 1.538 1.28l5-6a1 1 0 0 0 0-1.28l-5.001-6Z' />
						</svg>
						<span className='sr-only'>Toggle code block</span>
					</Button>

					<div
						style={{
							borderLeft: '1px solid #edeae9',
							alignSelf: 'stretch',
							marginTop: '4px',
							marginBottom: '4px',
						}}
					/>

					<Button
						variant='ghost'
						size='smIcon'
					>
						<svg
							className='Icon AiFillIcon HighlightSol HighlightSol--core'
							aria-hidden='true'
							focusable='false'
							viewBox='0 0 32 32'
							style={{
								flex: '0 0 auto',
								width: '16px',
								height: '16px',
								overflow: 'hidden',
							}}
						>
							<path d='M24.75 0h-1.5A5.25 5.25 0 0 1 18 5.25v1.5A5.25 5.25 0 0 1 23.25 12h1.5A5.25 5.25 0 0 1 30 6.75v-1.5A5.25 5.25 0 0 1 24.75 0ZM0 15c4.444 0 7 2.5 7 7h2c0-4.5 2.5-7 7-7v-2c-4.5 0-7-2.5-7-7H7c0 4.5-2.5 7-7 7v2Zm20.75 17A5.25 5.25 0 0 1 26 26.75v-1.5A5.25 5.25 0 0 1 20.75 20h-1.5A5.25 5.25 0 0 1 14 25.25v1.5A5.25 5.25 0 0 1 19.25 32h1.5Z' />
						</svg>
					</Button>
				</div>
			)}
		</div>
	);
};

export default Tiptap;

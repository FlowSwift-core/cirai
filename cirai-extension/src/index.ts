import * as extensionConfig from '../extension.json';

export function activate(status?: 'onStartupFinished', arg?: string): void { }

export function about(): void {
	const aboutContent = eda.sys_I18n.text('Cirai About Content', undefined, undefined, extensionConfig.version);
	eda.sys_Dialog.showInformationMessage(
		aboutContent,
		eda.sys_I18n.text('About'),
	);
}

export async function openChatTool(): Promise<void> {
	await eda.sys_IFrame.openIFrame('/iframe/index.html', 1200, 800, 'cirai-chat-tool', {
		maximizeButton: true,
		minimizeButton: true,
	});
}

'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}

interface ThemeProviderState {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	themes: Theme[];
}

const initialState: ThemeProviderState = {
	theme: 'system',
	setTheme: () => null,
	themes: ['light', 'dark', 'system'],
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
	children,
	defaultTheme = 'dark',
	storageKey = 'vite-ui-theme',
	...props
}: ThemeProviderProps) {
	const themes: Theme[] = ['light', 'dark', 'system'];
	const [theme, setTheme] = useState<Theme>(defaultTheme);

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove('light', 'dark');

		if (theme === 'system') {
			const systemTheme = window.matchMedia(
				'(prefers-color-scheme: dark)'
			).matches
				? 'dark'
				: 'light';

			root.classList.add(systemTheme);
			return;
		}

		root.classList.add(theme);
	}, [theme]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			// localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
		themes,
	};

	return (
		<ThemeProviderContext.Provider
			{...props}
			value={value}
		>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error('useTheme must be used within a ThemeProvider');

	return context;
};

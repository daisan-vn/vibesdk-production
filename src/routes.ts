import type { RouteObject } from 'react-router';
import React from 'react';

import App from './App';
import Home from './routes/home';
import Chat from './routes/chat/chat';
import Profile from './routes/profile';
import Settings from './routes/settings/index';
import AppsPage from './routes/apps';
import DeploymentsPage from './routes/deployments';
import TemplatesPage from './routes/templates';
import ConnectorsPage from './routes/connectors';
import AppView from './routes/app';
import DiscoverPage from './routes/discover';
import { ProtectedRoute } from './routes/protected-route';

const routes = [
	{
		path: '/',
		Component: App,
		children: [
			{
				index: true,
				Component: Home,
			},
			{
				path: 'chat/:chatId',
				Component: Chat,
			},
			{
				path: 'profile',
				element: React.createElement(ProtectedRoute, { children: React.createElement(Profile) }),
			},
			{
				path: 'settings',
				element: React.createElement(ProtectedRoute, { children: React.createElement(Settings) }),
			},
			{
				path: 'apps',
				element: React.createElement(ProtectedRoute, { children: React.createElement(AppsPage) }),
			},
			{
				path: 'deployments',
				element: React.createElement(ProtectedRoute, { children: React.createElement(DeploymentsPage) }),
			},
			{
				path: 'templates',
				Component: TemplatesPage,
			},
			{
				path: 'connectors',
				element: React.createElement(ProtectedRoute, { children: React.createElement(ConnectorsPage) }),
			},
			{
				path: 'app/:id',
				Component: AppView,
			},
			{
				path: 'discover',
				Component: DiscoverPage,
			},
		],
	},
] satisfies RouteObject[];

export { routes };

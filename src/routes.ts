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
import SolutionsPage from './routes/solutions';
import SolutionDetailPage from './routes/solutions/detail';
import PricingPage from './routes/pricing';
import EnterprisePage from './routes/enterprise';
import SecurityPage from './routes/security';
import ResourcesPage from './routes/resources';
import CommunityPage from './routes/community';
import OnboardingPage from './routes/onboarding';
import TemplateDetailPage from './routes/templates/detail';
import { DeploymentFailedPage, DomainNotMappedPage, AppNotFoundPage } from './routes/errors';
import ProjectDetailPage from './routes/projects/detail';
import PlansPage from './routes/plans';
import PlanDetailPage from './routes/plans/detail';
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
			{ path: 'solutions', Component: SolutionsPage },
			{ path: 'solutions/:slug', Component: SolutionDetailPage },
			{ path: 'pricing', Component: PricingPage },
			{ path: 'enterprise', Component: EnterprisePage },
			{ path: 'security', Component: SecurityPage },
			{ path: 'resources', Component: ResourcesPage },
			{ path: 'community', Component: CommunityPage },
			{ path: 'onboarding', Component: OnboardingPage },
			{ path: 'templates/:slug', Component: TemplateDetailPage },
			{ path: 'deployment-failed', Component: DeploymentFailedPage },
			{ path: 'domain-not-mapped', Component: DomainNotMappedPage },
			{ path: 'app-not-found', Component: AppNotFoundPage },
			{
				path: 'projects',
				element: React.createElement(ProtectedRoute, { children: React.createElement(AppsPage) }),
			},
			{
				path: 'projects/:id',
				element: React.createElement(ProtectedRoute, { children: React.createElement(ProjectDetailPage) }),
			},
			{
				path: 'plans',
				element: React.createElement(ProtectedRoute, { children: React.createElement(PlansPage) }),
			},
			{
				path: 'plans/:planId',
				element: React.createElement(ProtectedRoute, { children: React.createElement(PlanDetailPage) }),
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

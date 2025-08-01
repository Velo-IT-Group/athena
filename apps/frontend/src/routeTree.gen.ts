/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createServerRootRoute } from '@tanstack/react-start/server'

import { Route as rootRouteImport } from './routes/__root'
import { Route as AuthedRouteImport } from './routes/_authed'
import { Route as AuthRouteRouteImport } from './routes/auth/route'
import { Route as AuthedIndexRouteImport } from './routes/_authed/index'
import { Route as AuthTokenSetupRouteImport } from './routes/auth/token-setup'
import { Route as AuthLoginRouteImport } from './routes/auth/login'
import { Route as AuthAuthCodeErrorRouteImport } from './routes/auth/auth-code-error'
import { Route as AuthedTeamsIndexRouteImport } from './routes/_authed/teams/index'
import { Route as AuthedProposalsIndexRouteImport } from './routes/_authed/proposals/index'
import { Route as AuthedEngagementsIndexRouteImport } from './routes/_authed/engagements/index'
import { Route as AuthedEngagementsIdRouteImport } from './routes/_authed/engagements/$id'
import { Route as ReviewIdVersionIndexRouteImport } from './routes/review/$id/$version/index'
import { Route as AuthedProposalsNewBlankRouteImport } from './routes/_authed/proposals/new/blank'
import { Route as AuthedProposalsIdVersionRouteRouteImport } from './routes/_authed/proposals/$id/$version/route'
import { Route as AuthedProposalsIdVersionIndexRouteImport } from './routes/_authed/proposals/$id/$version/index'
import { Route as AuthedProposalsIdVersionWorkplanRouteImport } from './routes/_authed/proposals/$id/$version/workplan'
import { Route as AuthedProposalsIdVersionSettingsRouteImport } from './routes/_authed/proposals/$id/$version/settings'
import { Route as AuthedProposalsIdVersionProductsRouteImport } from './routes/_authed/proposals/$id/$version/products'
import { ServerRoute as AuthCallbackServerRouteImport } from './routes/auth/callback'
import { ServerRoute as ApiAuthEncryptServerRouteImport } from './routes/api/auth/encrypt'
import { ServerRoute as ApiAuthDecryptServerRouteImport } from './routes/api/auth/decrypt'
import { ServerRoute as RestV1EngagementsIndexServerRouteImport } from './routes/rest/v1/engagements/index'
import { ServerRoute as RestV1SystemSearchNumberServerRouteImport } from './routes/rest/v1/system/search-number'
import { ServerRoute as RestV1SystemIsOpenServerRouteImport } from './routes/rest/v1/system/is-open'
import { ServerRoute as RestV1SystemIsNumberBlacklistedServerRouteImport } from './routes/rest/v1/system/is-number-blacklisted'
import { ServerRoute as RestV1AuthCallbackServerRouteImport } from './routes/rest/v1/auth/callback'
import { ServerRoute as RestV1TaskrouterBlacklistedPhoneNumberIndexServerRouteImport } from './routes/rest/v1/taskrouter/blacklisted-phone-number/index'
import { ServerRoute as RestV1TaskrouterBlacklistedPhoneNumberIdServerRouteImport } from './routes/rest/v1/taskrouter/blacklisted-phone-number/$id'
import { ServerRoute as RestV1ProposalsIdConvertToManageServerRouteImport } from './routes/rest/v1/proposals/$id/convert-to-manage'

const rootServerRouteImport = createServerRootRoute()

const AuthedRoute = AuthedRouteImport.update({
  id: '/_authed',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthRouteRoute = AuthRouteRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthedIndexRoute = AuthedIndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthedRoute,
} as any)
const AuthTokenSetupRoute = AuthTokenSetupRouteImport.update({
  id: '/token-setup',
  path: '/token-setup',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthLoginRoute = AuthLoginRouteImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthAuthCodeErrorRoute = AuthAuthCodeErrorRouteImport.update({
  id: '/auth-code-error',
  path: '/auth-code-error',
  getParentRoute: () => AuthRouteRoute,
} as any)
const AuthedTeamsIndexRoute = AuthedTeamsIndexRouteImport.update({
  id: '/teams/',
  path: '/teams/',
  getParentRoute: () => AuthedRoute,
} as any)
const AuthedProposalsIndexRoute = AuthedProposalsIndexRouteImport.update({
  id: '/proposals/',
  path: '/proposals/',
  getParentRoute: () => AuthedRoute,
} as any)
const AuthedEngagementsIndexRoute = AuthedEngagementsIndexRouteImport.update({
  id: '/engagements/',
  path: '/engagements/',
  getParentRoute: () => AuthedRoute,
} as any)
const AuthedEngagementsIdRoute = AuthedEngagementsIdRouteImport.update({
  id: '/engagements/$id',
  path: '/engagements/$id',
  getParentRoute: () => AuthedRoute,
} as any)
const ReviewIdVersionIndexRoute = ReviewIdVersionIndexRouteImport.update({
  id: '/review/$id/$version/',
  path: '/review/$id/$version/',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthedProposalsNewBlankRoute = AuthedProposalsNewBlankRouteImport.update({
  id: '/proposals/new/blank',
  path: '/proposals/new/blank',
  getParentRoute: () => AuthedRoute,
} as any)
const AuthedProposalsIdVersionRouteRoute =
  AuthedProposalsIdVersionRouteRouteImport.update({
    id: '/proposals/$id/$version',
    path: '/proposals/$id/$version',
    getParentRoute: () => AuthedRoute,
  } as any)
const AuthedProposalsIdVersionIndexRoute =
  AuthedProposalsIdVersionIndexRouteImport.update({
    id: '/',
    path: '/',
    getParentRoute: () => AuthedProposalsIdVersionRouteRoute,
  } as any)
const AuthedProposalsIdVersionWorkplanRoute =
  AuthedProposalsIdVersionWorkplanRouteImport.update({
    id: '/workplan',
    path: '/workplan',
    getParentRoute: () => AuthedProposalsIdVersionRouteRoute,
  } as any)
const AuthedProposalsIdVersionSettingsRoute =
  AuthedProposalsIdVersionSettingsRouteImport.update({
    id: '/settings',
    path: '/settings',
    getParentRoute: () => AuthedProposalsIdVersionRouteRoute,
  } as any)
const AuthedProposalsIdVersionProductsRoute =
  AuthedProposalsIdVersionProductsRouteImport.update({
    id: '/products',
    path: '/products',
    getParentRoute: () => AuthedProposalsIdVersionRouteRoute,
  } as any)
const AuthCallbackServerRoute = AuthCallbackServerRouteImport.update({
  id: '/auth/callback',
  path: '/auth/callback',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiAuthEncryptServerRoute = ApiAuthEncryptServerRouteImport.update({
  id: '/api/auth/encrypt',
  path: '/api/auth/encrypt',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiAuthDecryptServerRoute = ApiAuthDecryptServerRouteImport.update({
  id: '/api/auth/decrypt',
  path: '/api/auth/decrypt',
  getParentRoute: () => rootServerRouteImport,
} as any)
const RestV1EngagementsIndexServerRoute =
  RestV1EngagementsIndexServerRouteImport.update({
    id: '/rest/v1/engagements/',
    path: '/rest/v1/engagements/',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const RestV1SystemSearchNumberServerRoute =
  RestV1SystemSearchNumberServerRouteImport.update({
    id: '/rest/v1/system/search-number',
    path: '/rest/v1/system/search-number',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const RestV1SystemIsOpenServerRoute =
  RestV1SystemIsOpenServerRouteImport.update({
    id: '/rest/v1/system/is-open',
    path: '/rest/v1/system/is-open',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const RestV1SystemIsNumberBlacklistedServerRoute =
  RestV1SystemIsNumberBlacklistedServerRouteImport.update({
    id: '/rest/v1/system/is-number-blacklisted',
    path: '/rest/v1/system/is-number-blacklisted',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const RestV1AuthCallbackServerRoute =
  RestV1AuthCallbackServerRouteImport.update({
    id: '/rest/v1/auth/callback',
    path: '/rest/v1/auth/callback',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute =
  RestV1TaskrouterBlacklistedPhoneNumberIndexServerRouteImport.update({
    id: '/rest/v1/taskrouter/blacklisted-phone-number/',
    path: '/rest/v1/taskrouter/blacklisted-phone-number/',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute =
  RestV1TaskrouterBlacklistedPhoneNumberIdServerRouteImport.update({
    id: '/rest/v1/taskrouter/blacklisted-phone-number/$id',
    path: '/rest/v1/taskrouter/blacklisted-phone-number/$id',
    getParentRoute: () => rootServerRouteImport,
  } as any)
const RestV1ProposalsIdConvertToManageServerRoute =
  RestV1ProposalsIdConvertToManageServerRouteImport.update({
    id: '/rest/v1/proposals/$id/convert-to-manage',
    path: '/rest/v1/proposals/$id/convert-to-manage',
    getParentRoute: () => rootServerRouteImport,
  } as any)

export interface FileRoutesByFullPath {
  '/auth': typeof AuthRouteRouteWithChildren
  '/auth/auth-code-error': typeof AuthAuthCodeErrorRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/token-setup': typeof AuthTokenSetupRoute
  '/': typeof AuthedIndexRoute
  '/engagements/$id': typeof AuthedEngagementsIdRoute
  '/engagements': typeof AuthedEngagementsIndexRoute
  '/proposals': typeof AuthedProposalsIndexRoute
  '/teams': typeof AuthedTeamsIndexRoute
  '/proposals/$id/$version': typeof AuthedProposalsIdVersionRouteRouteWithChildren
  '/proposals/new/blank': typeof AuthedProposalsNewBlankRoute
  '/review/$id/$version': typeof ReviewIdVersionIndexRoute
  '/proposals/$id/$version/products': typeof AuthedProposalsIdVersionProductsRoute
  '/proposals/$id/$version/settings': typeof AuthedProposalsIdVersionSettingsRoute
  '/proposals/$id/$version/workplan': typeof AuthedProposalsIdVersionWorkplanRoute
  '/proposals/$id/$version/': typeof AuthedProposalsIdVersionIndexRoute
}
export interface FileRoutesByTo {
  '/auth': typeof AuthRouteRouteWithChildren
  '/auth/auth-code-error': typeof AuthAuthCodeErrorRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/token-setup': typeof AuthTokenSetupRoute
  '/': typeof AuthedIndexRoute
  '/engagements/$id': typeof AuthedEngagementsIdRoute
  '/engagements': typeof AuthedEngagementsIndexRoute
  '/proposals': typeof AuthedProposalsIndexRoute
  '/teams': typeof AuthedTeamsIndexRoute
  '/proposals/new/blank': typeof AuthedProposalsNewBlankRoute
  '/review/$id/$version': typeof ReviewIdVersionIndexRoute
  '/proposals/$id/$version/products': typeof AuthedProposalsIdVersionProductsRoute
  '/proposals/$id/$version/settings': typeof AuthedProposalsIdVersionSettingsRoute
  '/proposals/$id/$version/workplan': typeof AuthedProposalsIdVersionWorkplanRoute
  '/proposals/$id/$version': typeof AuthedProposalsIdVersionIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/auth': typeof AuthRouteRouteWithChildren
  '/_authed': typeof AuthedRouteWithChildren
  '/auth/auth-code-error': typeof AuthAuthCodeErrorRoute
  '/auth/login': typeof AuthLoginRoute
  '/auth/token-setup': typeof AuthTokenSetupRoute
  '/_authed/': typeof AuthedIndexRoute
  '/_authed/engagements/$id': typeof AuthedEngagementsIdRoute
  '/_authed/engagements/': typeof AuthedEngagementsIndexRoute
  '/_authed/proposals/': typeof AuthedProposalsIndexRoute
  '/_authed/teams/': typeof AuthedTeamsIndexRoute
  '/_authed/proposals/$id/$version': typeof AuthedProposalsIdVersionRouteRouteWithChildren
  '/_authed/proposals/new/blank': typeof AuthedProposalsNewBlankRoute
  '/review/$id/$version/': typeof ReviewIdVersionIndexRoute
  '/_authed/proposals/$id/$version/products': typeof AuthedProposalsIdVersionProductsRoute
  '/_authed/proposals/$id/$version/settings': typeof AuthedProposalsIdVersionSettingsRoute
  '/_authed/proposals/$id/$version/workplan': typeof AuthedProposalsIdVersionWorkplanRoute
  '/_authed/proposals/$id/$version/': typeof AuthedProposalsIdVersionIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/auth'
    | '/auth/auth-code-error'
    | '/auth/login'
    | '/auth/token-setup'
    | '/'
    | '/engagements/$id'
    | '/engagements'
    | '/proposals'
    | '/teams'
    | '/proposals/$id/$version'
    | '/proposals/new/blank'
    | '/review/$id/$version'
    | '/proposals/$id/$version/products'
    | '/proposals/$id/$version/settings'
    | '/proposals/$id/$version/workplan'
    | '/proposals/$id/$version/'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/auth'
    | '/auth/auth-code-error'
    | '/auth/login'
    | '/auth/token-setup'
    | '/'
    | '/engagements/$id'
    | '/engagements'
    | '/proposals'
    | '/teams'
    | '/proposals/new/blank'
    | '/review/$id/$version'
    | '/proposals/$id/$version/products'
    | '/proposals/$id/$version/settings'
    | '/proposals/$id/$version/workplan'
    | '/proposals/$id/$version'
  id:
    | '__root__'
    | '/auth'
    | '/_authed'
    | '/auth/auth-code-error'
    | '/auth/login'
    | '/auth/token-setup'
    | '/_authed/'
    | '/_authed/engagements/$id'
    | '/_authed/engagements/'
    | '/_authed/proposals/'
    | '/_authed/teams/'
    | '/_authed/proposals/$id/$version'
    | '/_authed/proposals/new/blank'
    | '/review/$id/$version/'
    | '/_authed/proposals/$id/$version/products'
    | '/_authed/proposals/$id/$version/settings'
    | '/_authed/proposals/$id/$version/workplan'
    | '/_authed/proposals/$id/$version/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  AuthRouteRoute: typeof AuthRouteRouteWithChildren
  AuthedRoute: typeof AuthedRouteWithChildren
  ReviewIdVersionIndexRoute: typeof ReviewIdVersionIndexRoute
}
export interface FileServerRoutesByFullPath {
  '/auth/callback': typeof AuthCallbackServerRoute
  '/api/auth/decrypt': typeof ApiAuthDecryptServerRoute
  '/api/auth/encrypt': typeof ApiAuthEncryptServerRoute
  '/rest/v1/auth/callback': typeof RestV1AuthCallbackServerRoute
  '/rest/v1/system/is-number-blacklisted': typeof RestV1SystemIsNumberBlacklistedServerRoute
  '/rest/v1/system/is-open': typeof RestV1SystemIsOpenServerRoute
  '/rest/v1/system/search-number': typeof RestV1SystemSearchNumberServerRoute
  '/rest/v1/engagements': typeof RestV1EngagementsIndexServerRoute
  '/rest/v1/proposals/$id/convert-to-manage': typeof RestV1ProposalsIdConvertToManageServerRoute
  '/rest/v1/taskrouter/blacklisted-phone-number/$id': typeof RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute
  '/rest/v1/taskrouter/blacklisted-phone-number': typeof RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute
}
export interface FileServerRoutesByTo {
  '/auth/callback': typeof AuthCallbackServerRoute
  '/api/auth/decrypt': typeof ApiAuthDecryptServerRoute
  '/api/auth/encrypt': typeof ApiAuthEncryptServerRoute
  '/rest/v1/auth/callback': typeof RestV1AuthCallbackServerRoute
  '/rest/v1/system/is-number-blacklisted': typeof RestV1SystemIsNumberBlacklistedServerRoute
  '/rest/v1/system/is-open': typeof RestV1SystemIsOpenServerRoute
  '/rest/v1/system/search-number': typeof RestV1SystemSearchNumberServerRoute
  '/rest/v1/engagements': typeof RestV1EngagementsIndexServerRoute
  '/rest/v1/proposals/$id/convert-to-manage': typeof RestV1ProposalsIdConvertToManageServerRoute
  '/rest/v1/taskrouter/blacklisted-phone-number/$id': typeof RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute
  '/rest/v1/taskrouter/blacklisted-phone-number': typeof RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute
}
export interface FileServerRoutesById {
  __root__: typeof rootServerRouteImport
  '/auth/callback': typeof AuthCallbackServerRoute
  '/api/auth/decrypt': typeof ApiAuthDecryptServerRoute
  '/api/auth/encrypt': typeof ApiAuthEncryptServerRoute
  '/rest/v1/auth/callback': typeof RestV1AuthCallbackServerRoute
  '/rest/v1/system/is-number-blacklisted': typeof RestV1SystemIsNumberBlacklistedServerRoute
  '/rest/v1/system/is-open': typeof RestV1SystemIsOpenServerRoute
  '/rest/v1/system/search-number': typeof RestV1SystemSearchNumberServerRoute
  '/rest/v1/engagements/': typeof RestV1EngagementsIndexServerRoute
  '/rest/v1/proposals/$id/convert-to-manage': typeof RestV1ProposalsIdConvertToManageServerRoute
  '/rest/v1/taskrouter/blacklisted-phone-number/$id': typeof RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute
  '/rest/v1/taskrouter/blacklisted-phone-number/': typeof RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute
}
export interface FileServerRouteTypes {
  fileServerRoutesByFullPath: FileServerRoutesByFullPath
  fullPaths:
    | '/auth/callback'
    | '/api/auth/decrypt'
    | '/api/auth/encrypt'
    | '/rest/v1/auth/callback'
    | '/rest/v1/system/is-number-blacklisted'
    | '/rest/v1/system/is-open'
    | '/rest/v1/system/search-number'
    | '/rest/v1/engagements'
    | '/rest/v1/proposals/$id/convert-to-manage'
    | '/rest/v1/taskrouter/blacklisted-phone-number/$id'
    | '/rest/v1/taskrouter/blacklisted-phone-number'
  fileServerRoutesByTo: FileServerRoutesByTo
  to:
    | '/auth/callback'
    | '/api/auth/decrypt'
    | '/api/auth/encrypt'
    | '/rest/v1/auth/callback'
    | '/rest/v1/system/is-number-blacklisted'
    | '/rest/v1/system/is-open'
    | '/rest/v1/system/search-number'
    | '/rest/v1/engagements'
    | '/rest/v1/proposals/$id/convert-to-manage'
    | '/rest/v1/taskrouter/blacklisted-phone-number/$id'
    | '/rest/v1/taskrouter/blacklisted-phone-number'
  id:
    | '__root__'
    | '/auth/callback'
    | '/api/auth/decrypt'
    | '/api/auth/encrypt'
    | '/rest/v1/auth/callback'
    | '/rest/v1/system/is-number-blacklisted'
    | '/rest/v1/system/is-open'
    | '/rest/v1/system/search-number'
    | '/rest/v1/engagements/'
    | '/rest/v1/proposals/$id/convert-to-manage'
    | '/rest/v1/taskrouter/blacklisted-phone-number/$id'
    | '/rest/v1/taskrouter/blacklisted-phone-number/'
  fileServerRoutesById: FileServerRoutesById
}
export interface RootServerRouteChildren {
  AuthCallbackServerRoute: typeof AuthCallbackServerRoute
  ApiAuthDecryptServerRoute: typeof ApiAuthDecryptServerRoute
  ApiAuthEncryptServerRoute: typeof ApiAuthEncryptServerRoute
  RestV1AuthCallbackServerRoute: typeof RestV1AuthCallbackServerRoute
  RestV1SystemIsNumberBlacklistedServerRoute: typeof RestV1SystemIsNumberBlacklistedServerRoute
  RestV1SystemIsOpenServerRoute: typeof RestV1SystemIsOpenServerRoute
  RestV1SystemSearchNumberServerRoute: typeof RestV1SystemSearchNumberServerRoute
  RestV1EngagementsIndexServerRoute: typeof RestV1EngagementsIndexServerRoute
  RestV1ProposalsIdConvertToManageServerRoute: typeof RestV1ProposalsIdConvertToManageServerRoute
  RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute: typeof RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute
  RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute: typeof RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authed': {
      id: '/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthRouteRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authed/': {
      id: '/_authed/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AuthedIndexRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/auth/token-setup': {
      id: '/auth/token-setup'
      path: '/token-setup'
      fullPath: '/auth/token-setup'
      preLoaderRoute: typeof AuthTokenSetupRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/auth/login': {
      id: '/auth/login'
      path: '/login'
      fullPath: '/auth/login'
      preLoaderRoute: typeof AuthLoginRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/auth/auth-code-error': {
      id: '/auth/auth-code-error'
      path: '/auth-code-error'
      fullPath: '/auth/auth-code-error'
      preLoaderRoute: typeof AuthAuthCodeErrorRouteImport
      parentRoute: typeof AuthRouteRoute
    }
    '/_authed/teams/': {
      id: '/_authed/teams/'
      path: '/teams'
      fullPath: '/teams'
      preLoaderRoute: typeof AuthedTeamsIndexRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/_authed/proposals/': {
      id: '/_authed/proposals/'
      path: '/proposals'
      fullPath: '/proposals'
      preLoaderRoute: typeof AuthedProposalsIndexRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/_authed/engagements/': {
      id: '/_authed/engagements/'
      path: '/engagements'
      fullPath: '/engagements'
      preLoaderRoute: typeof AuthedEngagementsIndexRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/_authed/engagements/$id': {
      id: '/_authed/engagements/$id'
      path: '/engagements/$id'
      fullPath: '/engagements/$id'
      preLoaderRoute: typeof AuthedEngagementsIdRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/review/$id/$version/': {
      id: '/review/$id/$version/'
      path: '/review/$id/$version'
      fullPath: '/review/$id/$version'
      preLoaderRoute: typeof ReviewIdVersionIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/_authed/proposals/new/blank': {
      id: '/_authed/proposals/new/blank'
      path: '/proposals/new/blank'
      fullPath: '/proposals/new/blank'
      preLoaderRoute: typeof AuthedProposalsNewBlankRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/_authed/proposals/$id/$version': {
      id: '/_authed/proposals/$id/$version'
      path: '/proposals/$id/$version'
      fullPath: '/proposals/$id/$version'
      preLoaderRoute: typeof AuthedProposalsIdVersionRouteRouteImport
      parentRoute: typeof AuthedRoute
    }
    '/_authed/proposals/$id/$version/': {
      id: '/_authed/proposals/$id/$version/'
      path: '/'
      fullPath: '/proposals/$id/$version/'
      preLoaderRoute: typeof AuthedProposalsIdVersionIndexRouteImport
      parentRoute: typeof AuthedProposalsIdVersionRouteRoute
    }
    '/_authed/proposals/$id/$version/workplan': {
      id: '/_authed/proposals/$id/$version/workplan'
      path: '/workplan'
      fullPath: '/proposals/$id/$version/workplan'
      preLoaderRoute: typeof AuthedProposalsIdVersionWorkplanRouteImport
      parentRoute: typeof AuthedProposalsIdVersionRouteRoute
    }
    '/_authed/proposals/$id/$version/settings': {
      id: '/_authed/proposals/$id/$version/settings'
      path: '/settings'
      fullPath: '/proposals/$id/$version/settings'
      preLoaderRoute: typeof AuthedProposalsIdVersionSettingsRouteImport
      parentRoute: typeof AuthedProposalsIdVersionRouteRoute
    }
    '/_authed/proposals/$id/$version/products': {
      id: '/_authed/proposals/$id/$version/products'
      path: '/products'
      fullPath: '/proposals/$id/$version/products'
      preLoaderRoute: typeof AuthedProposalsIdVersionProductsRouteImport
      parentRoute: typeof AuthedProposalsIdVersionRouteRoute
    }
  }
}
declare module '@tanstack/react-start/server' {
  interface ServerFileRoutesByPath {
    '/auth/callback': {
      id: '/auth/callback'
      path: '/auth/callback'
      fullPath: '/auth/callback'
      preLoaderRoute: typeof AuthCallbackServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/auth/encrypt': {
      id: '/api/auth/encrypt'
      path: '/api/auth/encrypt'
      fullPath: '/api/auth/encrypt'
      preLoaderRoute: typeof ApiAuthEncryptServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/auth/decrypt': {
      id: '/api/auth/decrypt'
      path: '/api/auth/decrypt'
      fullPath: '/api/auth/decrypt'
      preLoaderRoute: typeof ApiAuthDecryptServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/engagements/': {
      id: '/rest/v1/engagements/'
      path: '/rest/v1/engagements'
      fullPath: '/rest/v1/engagements'
      preLoaderRoute: typeof RestV1EngagementsIndexServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/system/search-number': {
      id: '/rest/v1/system/search-number'
      path: '/rest/v1/system/search-number'
      fullPath: '/rest/v1/system/search-number'
      preLoaderRoute: typeof RestV1SystemSearchNumberServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/system/is-open': {
      id: '/rest/v1/system/is-open'
      path: '/rest/v1/system/is-open'
      fullPath: '/rest/v1/system/is-open'
      preLoaderRoute: typeof RestV1SystemIsOpenServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/system/is-number-blacklisted': {
      id: '/rest/v1/system/is-number-blacklisted'
      path: '/rest/v1/system/is-number-blacklisted'
      fullPath: '/rest/v1/system/is-number-blacklisted'
      preLoaderRoute: typeof RestV1SystemIsNumberBlacklistedServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/auth/callback': {
      id: '/rest/v1/auth/callback'
      path: '/rest/v1/auth/callback'
      fullPath: '/rest/v1/auth/callback'
      preLoaderRoute: typeof RestV1AuthCallbackServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/taskrouter/blacklisted-phone-number/': {
      id: '/rest/v1/taskrouter/blacklisted-phone-number/'
      path: '/rest/v1/taskrouter/blacklisted-phone-number'
      fullPath: '/rest/v1/taskrouter/blacklisted-phone-number'
      preLoaderRoute: typeof RestV1TaskrouterBlacklistedPhoneNumberIndexServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/taskrouter/blacklisted-phone-number/$id': {
      id: '/rest/v1/taskrouter/blacklisted-phone-number/$id'
      path: '/rest/v1/taskrouter/blacklisted-phone-number/$id'
      fullPath: '/rest/v1/taskrouter/blacklisted-phone-number/$id'
      preLoaderRoute: typeof RestV1TaskrouterBlacklistedPhoneNumberIdServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/rest/v1/proposals/$id/convert-to-manage': {
      id: '/rest/v1/proposals/$id/convert-to-manage'
      path: '/rest/v1/proposals/$id/convert-to-manage'
      fullPath: '/rest/v1/proposals/$id/convert-to-manage'
      preLoaderRoute: typeof RestV1ProposalsIdConvertToManageServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
  }
}

interface AuthRouteRouteChildren {
  AuthAuthCodeErrorRoute: typeof AuthAuthCodeErrorRoute
  AuthLoginRoute: typeof AuthLoginRoute
  AuthTokenSetupRoute: typeof AuthTokenSetupRoute
}

const AuthRouteRouteChildren: AuthRouteRouteChildren = {
  AuthAuthCodeErrorRoute: AuthAuthCodeErrorRoute,
  AuthLoginRoute: AuthLoginRoute,
  AuthTokenSetupRoute: AuthTokenSetupRoute,
}

const AuthRouteRouteWithChildren = AuthRouteRoute._addFileChildren(
  AuthRouteRouteChildren,
)

interface AuthedProposalsIdVersionRouteRouteChildren {
  AuthedProposalsIdVersionProductsRoute: typeof AuthedProposalsIdVersionProductsRoute
  AuthedProposalsIdVersionSettingsRoute: typeof AuthedProposalsIdVersionSettingsRoute
  AuthedProposalsIdVersionWorkplanRoute: typeof AuthedProposalsIdVersionWorkplanRoute
  AuthedProposalsIdVersionIndexRoute: typeof AuthedProposalsIdVersionIndexRoute
}

const AuthedProposalsIdVersionRouteRouteChildren: AuthedProposalsIdVersionRouteRouteChildren =
  {
    AuthedProposalsIdVersionProductsRoute:
      AuthedProposalsIdVersionProductsRoute,
    AuthedProposalsIdVersionSettingsRoute:
      AuthedProposalsIdVersionSettingsRoute,
    AuthedProposalsIdVersionWorkplanRoute:
      AuthedProposalsIdVersionWorkplanRoute,
    AuthedProposalsIdVersionIndexRoute: AuthedProposalsIdVersionIndexRoute,
  }

const AuthedProposalsIdVersionRouteRouteWithChildren =
  AuthedProposalsIdVersionRouteRoute._addFileChildren(
    AuthedProposalsIdVersionRouteRouteChildren,
  )

interface AuthedRouteChildren {
  AuthedIndexRoute: typeof AuthedIndexRoute
  AuthedEngagementsIdRoute: typeof AuthedEngagementsIdRoute
  AuthedEngagementsIndexRoute: typeof AuthedEngagementsIndexRoute
  AuthedProposalsIndexRoute: typeof AuthedProposalsIndexRoute
  AuthedTeamsIndexRoute: typeof AuthedTeamsIndexRoute
  AuthedProposalsIdVersionRouteRoute: typeof AuthedProposalsIdVersionRouteRouteWithChildren
  AuthedProposalsNewBlankRoute: typeof AuthedProposalsNewBlankRoute
}

const AuthedRouteChildren: AuthedRouteChildren = {
  AuthedIndexRoute: AuthedIndexRoute,
  AuthedEngagementsIdRoute: AuthedEngagementsIdRoute,
  AuthedEngagementsIndexRoute: AuthedEngagementsIndexRoute,
  AuthedProposalsIndexRoute: AuthedProposalsIndexRoute,
  AuthedTeamsIndexRoute: AuthedTeamsIndexRoute,
  AuthedProposalsIdVersionRouteRoute:
    AuthedProposalsIdVersionRouteRouteWithChildren,
  AuthedProposalsNewBlankRoute: AuthedProposalsNewBlankRoute,
}

const AuthedRouteWithChildren =
  AuthedRoute._addFileChildren(AuthedRouteChildren)

const rootRouteChildren: RootRouteChildren = {
  AuthRouteRoute: AuthRouteRouteWithChildren,
  AuthedRoute: AuthedRouteWithChildren,
  ReviewIdVersionIndexRoute: ReviewIdVersionIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
const rootServerRouteChildren: RootServerRouteChildren = {
  AuthCallbackServerRoute: AuthCallbackServerRoute,
  ApiAuthDecryptServerRoute: ApiAuthDecryptServerRoute,
  ApiAuthEncryptServerRoute: ApiAuthEncryptServerRoute,
  RestV1AuthCallbackServerRoute: RestV1AuthCallbackServerRoute,
  RestV1SystemIsNumberBlacklistedServerRoute:
    RestV1SystemIsNumberBlacklistedServerRoute,
  RestV1SystemIsOpenServerRoute: RestV1SystemIsOpenServerRoute,
  RestV1SystemSearchNumberServerRoute: RestV1SystemSearchNumberServerRoute,
  RestV1EngagementsIndexServerRoute: RestV1EngagementsIndexServerRoute,
  RestV1ProposalsIdConvertToManageServerRoute:
    RestV1ProposalsIdConvertToManageServerRoute,
  RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute:
    RestV1TaskrouterBlacklistedPhoneNumberIdServerRoute,
  RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute:
    RestV1TaskrouterBlacklistedPhoneNumberIndexServerRoute,
}
export const serverRouteTree = rootServerRouteImport
  ._addFileChildren(rootServerRouteChildren)
  ._addFileTypes<FileServerRouteTypes>()

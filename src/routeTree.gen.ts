/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as CartRouteImport } from './routes/cart'
import { Route as AdminRouteImport } from './routes/admin' // 👈 ADDED
import { Route as ProductsIndexRouteImport } from './routes/products.index'
import { Route as ProductsProductIdRouteImport } from './routes/products.$productId'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const CartRoute = CartRouteImport.update({
  id: '/cart',
  path: '/cart',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminRoute = AdminRouteImport.update({ // 👈 ADDED
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)
const ProductsIndexRoute = ProductsIndexRouteImport.update({
  id: '/products/',
  path: '/products/',
  getParentRoute: () => rootRouteImport,
} as any)
const ProductsProductIdRoute = ProductsProductIdRouteImport.update({
  id: '/products/$productId',
  path: '/products/$productId',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/cart': typeof CartRoute
  '/admin': typeof AdminRoute // 👈 ADDED
  '/products/$productId': typeof ProductsProductIdRoute
  '/products/': typeof ProductsIndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/cart': typeof CartRoute
  '/admin': typeof AdminRoute // 👈 ADDED
  '/products/$productId': typeof ProductsProductIdRoute
  '/products': typeof ProductsIndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/cart': typeof CartRoute
  '/admin': typeof AdminRoute // 👈 ADDED
  '/products/$productId': typeof ProductsProductIdRoute
  '/products/': typeof ProductsIndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/cart' | '/admin' | '/products/$productId' | '/products/' // 👈 UPDATED
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/cart' | '/admin' | '/products/$productId' | '/products' // 👈 UPDATED
  id: '__root__' | '/' | '/cart' | '/admin' | '/products/$productId' | '/products/' // 👈 UPDATED
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  CartRoute: typeof CartRoute
  AdminRoute: typeof AdminRoute // 👈 ADDED
  ProductsProductIdRoute: typeof ProductsProductIdRoute
  ProductsIndexRoute: typeof ProductsIndexRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/cart': {
      id: '/cart'
      path: '/cart'
      fullPath: '/cart'
      preLoaderRoute: typeof CartRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/admin': { // 👈 ADDED
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/products/': {
      id: '/products/'
      path: '/products'
      fullPath: '/products/'
      preLoaderRoute: typeof ProductsIndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/products/$productId': {
      id: '/products/$productId'
      path: '/products/$productId'
      fullPath: '/products/$productId'
      preLoaderRoute: typeof ProductsProductIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CartRoute: CartRoute,
  AdminRoute: AdminRoute, // 👈 ADDED
  ProductsProductIdRoute: ProductsProductIdRoute,
  ProductsIndexRoute: ProductsIndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}

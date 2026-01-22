export interface User {
  id: string
  email: string
  name: string
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  categoryId: string
  categoryName?: string
  sku?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export * from './customer.types'
export * from './invoice.types'

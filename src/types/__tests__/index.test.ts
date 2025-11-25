import { UserRole, User, Profile, Product, Gig } from '../index'

describe('Type definitions', () => {
  it('should define UserRole union type correctly', () => {
    const roles: UserRole[] = ['buyer', 'seller', 'client', 'worker']

    roles.forEach(role => {
      expect(['buyer', 'seller', 'client', 'worker']).toContain(role)
    })
  })

  it('should allow creating User object with correct structure', () => {
    const user: User = {
      id: '123',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(user.id).toBe('123')
    expect(user.email).toBe('test@example.com')
    expect(user.full_name).toBe('Test User')
  })

  it('should allow creating Profile object with correct structure', () => {
    const profile: Profile = {
      id: '123',
      user_id: 'user123',
      full_name: 'Test User',
      title: 'Software Developer',
      bio: 'A passionate developer',
      location: 'New York',
      experience_years: 5,
      skills: ['JavaScript', 'React', 'TypeScript'],
      avatar_url: 'https://example.com/avatar.jpg',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(profile.full_name).toBe('Test User')
    expect(profile.skills).toContain('React')
    expect(profile.experience_years).toBe(5)
  })

  it('should allow creating Product object with correct structure', () => {
    const product: Product = {
      id: '123',
      seller_id: 'seller123',
      title: 'Test Product',
      description: 'A great product',
      price: 99.99,
      stock_quantity: 10,
      category: 'Electronics',
      images: ['image1.jpg', 'image2.jpg'],
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(product.title).toBe('Test Product')
    expect(product.price).toBe(99.99)
    expect(product.status).toBe('active')
  })

  it('should allow creating Gig object with correct structure', () => {
    const gig: Gig = {
      id: '123',
      worker_id: 'worker123',
      title: 'Web Development Service',
      description: 'I will build your website',
      price: 500,
      delivery_days: 7,
      category: 'Web Development',
      skills: ['HTML', 'CSS', 'JavaScript'],
      images: ['gig1.jpg'],
      status: 'active',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    expect(gig.title).toBe('Web Development Service')
    expect(gig.delivery_days).toBe(7)
    expect(gig.skills).toContain('JavaScript')
  })
})
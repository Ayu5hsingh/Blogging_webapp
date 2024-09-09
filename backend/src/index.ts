import { Hono } from 'hono'

const app = new Hono()

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
}).$extends(withAccelerate())


app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.post('/api/v1/user/signup',(c)=>{
  return c.text('User registered successfully!')
})

app.post('/api/v1/user/signin',(c)=>{
  return c.json({message: 'User logged in successfully!', token: 'your_token'})
})

app.post('/api/v1/blog',(c)=>{
  return c.json({message: 'Blog created successfully!', id: 'your_id'})
})

app.put('/api/v1/blog/:id',(c)=>{
  return c.json({message: 'Blog updated successfully!'})
})

export default app

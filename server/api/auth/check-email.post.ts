export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body
  
  // Basic validation
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
    })
  }
  
  // Simulate checking if email exists in database
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Mock logic - in real app, check against database
  const existingEmails = [
    'user@example.com',
    'test@test.com',
    'demo@demo.com'
  ]
  
  const exists = existingEmails.includes(email.toLowerCase())
  
  return {
    success: true,
    data: {
      exists,
      email
    }
  }
})
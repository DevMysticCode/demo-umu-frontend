export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Simulate user registration logic
  const { fullName, email, password, action } = body

  if (action === 'create_account' || (fullName && email && password)) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: 'Account created successfully',
      user: {
        id: '1',
        email: email || 'user@example.com',
        name: fullName || 'New User',
      },
      token: 'mock-jwt-token',
      redirect: '/thank-you',
    }
  }

  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid action',
  })
})

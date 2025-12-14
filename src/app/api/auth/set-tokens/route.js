import { NextResponse } from 'next/server'

export async function POST(request) {
	try {
		const { accessToken, refreshToken } = await request.json()

		if (!accessToken || !refreshToken) {
			return NextResponse.json(
				{ error: 'Tokens are required' },
				{ status: 400 }
			)
		}

		const response = NextResponse.json({ success: true })

		// Set httpOnly cookies
		// Note: For cross-origin (different domains), cookies won't work with httpOnly
		// We'll need to use Authorization header instead, or use a proxy
		const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
		
		response.cookies.set('access_token', accessToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: 'lax', // 'lax' works for same-site, 'none' requires secure and proper CORS
			maxAge: 30 * 60, // 30 minutes
			path: '/',
		})

		response.cookies.set('refresh_token', refreshToken, {
			httpOnly: true,
			secure: isProduction,
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60, // 7 days
			path: '/',
		})

		return response
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to set tokens' },
			{ status: 500 }
		)
	}
}


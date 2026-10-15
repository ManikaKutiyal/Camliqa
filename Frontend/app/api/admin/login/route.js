import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Use service role to bypass RLS for admin verification
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Sign in the user using their credentials via the admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Verify role using service role (bypasses RLS entirely)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', authData.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. This account does not have admin privileges.' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      user: { email: profile.email, role: 'admin', name: profile.full_name },
    });
  } catch (err) {
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

import { createClient } from 'npm:@supabase/supabase-js';

// Auto-fix update: Ensuring all auth operations work correctly
// Updated: 2026-04-11 - Schema fix deployment

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Supabase client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function signUp(email: string, password: string, name: string) {
  try {
    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log('Sign up error:', error);
      throw error;
    }

    console.log('User created successfully:', data.user.id);

    // Now sign in the user to get a session
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.log('Auto sign-in after signup error:', signInError);
      // User was created but auto-login failed, still return success
      return { success: true, user: data.user };
    }

    return { success: true, user: signInData.user, session: signInData.session };
  } catch (error: any) {
    console.log('Error in signUp:', error);
    throw new Error(error.message || 'Failed to create user');
  }
}

export async function signIn(email: string, password: string) {
  try {
    // Use regular client for sign in (not admin)
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log('Sign in error:', error);
      throw error;
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error: any) {
    console.log('Error in signIn:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

export async function getUser(accessToken: string) {
  try {
    console.log('🔍 Validating access token...');
    console.log('📝 Token length:', accessToken?.length);
    console.log('📝 Token starts with:', accessToken?.substring(0, 30) + '...');
    
    if (!accessToken) {
      throw new Error('No access token provided');
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

    if (error) {
      console.log('❌ Get user error:', error.message);
      console.log('❌ Error details:', JSON.stringify(error));
      throw error;
    }
    
    if (!user) {
      throw new Error('User not found with this token');
    }

    console.log('✅ User validated successfully:', user.id);
    return { success: true, user };
  } catch (error: any) {
    console.log('❌ Error in getUser:', error.message || error);
    throw new Error(error.message || 'Failed to get user');
  }
}

export async function updateUserProfile(userId: string, updates: { name?: string; email?: string }) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: updates.email,
      user_metadata: { name: updates.name },
    });

    if (error) {
      console.log('Update user profile error:', error);
      throw error;
    }

    return { success: true, user: data.user };
  } catch (error: any) {
    console.log('Error in updateUserProfile:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (error) {
      console.log('Update password error:', error);
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.log('Error in updateUserPassword:', error);
    throw new Error(error.message || 'Failed to update password');
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    // Use regular client for password reset (not admin)
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get the app URL from environment
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

    // Generate password reset token using Supabase Auth
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/#type=recovery`,
    });

    if (error) {
      console.log('Password reset token generation error:', error);
      throw error;
    }

    console.log('✅ Password reset token generated for:', email);
    
    // Note: Supabase will send the email automatically with the recovery link
    // The email is sent by Supabase's email service, not Resend
    // If you want to use Resend for the email, you would need to:
    // 1. Generate a custom token
    // 2. Store it in database
    // 3. Send email via Resend with your custom reset link
    
    return { success: true, message: 'Password reset email sent' };
  } catch (error: any) {
    console.log('Error in sendPasswordResetEmail:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}
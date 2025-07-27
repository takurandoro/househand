#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.production' });

const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!projectRef) {
  console.error('❌ SUPABASE_PROJECT_REF not found in environment variables');
  console.log('Please add SUPABASE_PROJECT_REF to your .env.production file');
  process.exit(1);
}

console.log('🚀 Deploying HouseHand to Supabase production...');

try {
  // Link to production project
  console.log('📎 Linking to production project...');
  execSync(`supabase link --project-ref ${projectRef}`, { stdio: 'inherit' });

  // Push database migrations
  console.log('🗄️  Pushing database migrations...');
  execSync('supabase db push', { stdio: 'inherit' });

  // Deploy edge functions (if any)
  console.log('⚡ Deploying edge functions...');
  execSync('supabase functions deploy', { stdio: 'inherit' });

  console.log('✅ Supabase deployment completed successfully!');
  
  console.log('\n📋 Next steps:');
  console.log('1. Update your Supabase dashboard authentication settings');
  console.log('2. Set your production domain in Site URL');
  console.log('3. Add your production domain to redirect URLs');
  console.log('4. Test authentication flow in production');

} catch (error) {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
} 
// =====================================================================
// Database Seeding Script (seed.js)
// Populates core reference structures and local development mocks.
// =====================================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed Connected Platforms (System catalog)
  const platforms = [
    {
      name: 'Slack Integration',
      code: 'slack',
      type: 'COMMUNICATION',
      isActive: true
    },
    {
      name: 'LinkedIn Platform',
      code: 'linkedin',
      type: 'SOCIAL',
      isActive: true
    },
    {
      name: 'Meta (Facebook & Instagram)',
      code: 'meta',
      type: 'SOCIAL',
      isActive: true
    },
    {
      name: 'X Platform (Twitter)',
      code: 'x',
      type: 'SOCIAL',
      isActive: true
    },
    {
      name: 'Shopify Store Integration',
      code: 'shopify',
      type: 'COMMERCE',
      isActive: true
    },
    {
      name: 'Custom Webhook Automation',
      code: 'webhook',
      type: 'AUTOMATION',
      isActive: true
    }
  ];

  console.log('Seeding Connected Platforms...');
  const seededPlatforms = [];
  for (const plat of platforms) {
    const platform = await prisma.connectedPlatform.upsert({
      where: { code: plat.code },
      update: { name: plat.name, type: plat.type, isActive: plat.isActive },
      create: plat
    });
    seededPlatforms.push(platform);
  }
  console.log(`Successfully seeded ${seededPlatforms.length} platforms.`);

  // If running in production, stop seeding here (avoid creating dev mocks)
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Production environment detected. Skipping development mock seeding.');
    console.log('✅ Seeding completed successfully!');
    return;
  }

  // 2. Seed Default User
  console.log('Seeding Default Developer User...');
  const defaultUser = await prisma.user.upsert({
    where: { email: 'developer@sched.com' },
    update: {},
    create: {
      email: 'developer@sched.com',
      passwordHash: '$2b$12$L7Rdf4a3nFGe7k.oGzJz1.G8a1s.o21V9yO9aR/bZ6W4n87e/j3mC', // mock hash for "password123"
      firstName: 'Dev',
      lastName: 'User'
    }
  });
  console.log(`Seeded User: ${defaultUser.email} (${defaultUser.id})`);

  // 3. Seed Default Workspace
  console.log('Seeding Default Workspace...');
  const defaultWorkspace = await prisma.workspace.create({
    data: {
      name: 'Default Development Team Workspace'
    }
  });
  console.log(`Seeded Workspace: ${defaultWorkspace.name} (${defaultWorkspace.id})`);

  // 4. Link User to Workspace as OWNER
  console.log('Linking User to Workspace...');
  const membership = await prisma.workspaceMember.create({
    data: {
      workspaceId: defaultWorkspace.id,
      userId: defaultUser.id,
      role: 'OWNER'
    }
  });
  console.log(`Linked membership role: ${membership.role}`);

  // 5. Seed an Integration & Social Account Mock
  console.log('Seeding Workspace Integrations & Channels...');
  const slackPlatform = seededPlatforms.find(p => p.code === 'slack');
  if (slackPlatform) {
    const integration = await prisma.integration.create({
      data: {
        workspaceId: defaultWorkspace.id,
        platformId: slackPlatform.id,
        accessToken: 'enc_slack_access_token_mock_val',
        refreshToken: 'enc_slack_refresh_token_mock_val',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        settings: { teamId: 'T123456', teamName: 'Development Workspace' }
      }
    });

    const socialAccount = await prisma.socialAccount.create({
      data: {
        integrationId: integration.id,
        platformAccountId: 'C654321',
        platformUsername: '#general-channel',
        platformAvatar: 'https://cdn.brandfolder.com/5gg39p/as/pl5v6c8916499/slack-octothorpe.png',
        settings: { isDefault: true }
      }
    });
    console.log(`Seeded Slack Integration for channel: ${socialAccount.platformUsername}`);

    // 6. Seed Media Assets
    console.log('Seeding Workspace Media Asset Library...');
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        workspaceId: defaultWorkspace.id,
        userId: defaultUser.id,
        name: 'Promo Logo banner',
        fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
        mimeType: 'image/jpeg',
        fileSize: 102450,
        width: 1920,
        height: 1080
      }
    });
    console.log(`Seeded Asset: ${mediaAsset.name} (${mediaAsset.id})`);

    // 7. Seed publication content (Post)
    console.log('Seeding Sample Publication content...');
    const post = await prisma.post.create({
      data: {
        workspaceId: defaultWorkspace.id,
        userId: defaultUser.id,
        title: 'Weekly Release Announcement',
        content: 'We are thrilled to launch Sched v1.0.0 today! Manage all platform postings in one place.',
        status: 'SCHEDULED'
      }
    });

    // Link Post to MediaAsset
    await prisma.postMedia.create({
      data: {
        postId: post.id,
        mediaAssetId: mediaAsset.id,
        sortOrder: 0
      }
    });
    console.log(`Seeded Post: ${post.title} (${post.id})`);

    // 8. Seed Schedule Event
    console.log('Seeding scheduled timing records...');
    const schedule = await prisma.schedule.create({
      data: {
        postId: post.id,
        socialAccountId: socialAccount.id,
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'PENDING'
      }
    });
    console.log(`Seeded Schedule record: triggers at ${schedule.scheduledAt.toISOString()}`);

    // 9. Seed Audit Logs and AI Histories
    console.log('Seeding operational audits and AI records...');
    await prisma.auditLog.create({
      data: {
        workspaceId: defaultWorkspace.id,
        userId: defaultUser.id,
        action: 'INTEGRATION_ADDED',
        entityType: 'Integration',
        entityId: integration.id,
        ipAddress: '127.0.0.1',
        metadata: { platform: 'slack' }
      }
    });

    await prisma.aiHistory.create({
      data: {
        workspaceId: defaultWorkspace.id,
        userId: defaultUser.id,
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        prompt: 'Write a promotional social media post announcing our system release.',
        response: 'We are thrilled to launch Sched v1.0.0 today! Manage all platform postings in one place.',
        promptTokens: 15,
        completionTokens: 22
      }
    });
  }

  // 10. Seed User Notification
  await prisma.notification.create({
    data: {
      workspaceId: defaultWorkspace.id,
      userId: defaultUser.id,
      title: 'Database Configured Successfully',
      message: 'Your universal integration backend database has been successfully instantiated.',
      type: 'SYSTEM'
    }
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding process:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

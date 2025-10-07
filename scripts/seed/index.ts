import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ai-cleanup.com' },
    update: {},
    create: {
      email: 'admin@ai-cleanup.com',
      passwordHash: adminPassword,
      fullName: 'System Administrator',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create test user
  const testPassword = await bcrypt.hash('test123', 12);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@ai-cleanup.com' },
    update: {},
    create: {
      email: 'test@ai-cleanup.com',
      passwordHash: testPassword,
      fullName: 'Test User',
      isActive: true,
    },
  });

  console.log('✅ Created test user:', testUser.email);

  // Create sample license keys
  const adminLicense = await prisma.licenseKey.create({
    data: {
      key: randomUUID(),
      userId: adminUser.id,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  console.log('✅ Created admin license key:', adminLicense.key);

  const testLicense = await prisma.licenseKey.create({
    data: {
      key: randomUUID(),
      userId: testUser.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  console.log('✅ Created test license key:', testLicense.key);

  // Create sample upload session
  const sampleUpload = await prisma.upload.create({
    data: {
      userId: testUser.id,
      totalFiles: 3,
      status: 'completed',
      completedAt: new Date(),
      fileMetadata: {
        source: 'web_upload',
        browser: 'Chrome',
      },
    },
  });

  console.log('✅ Created sample upload session:', sampleUpload.id);

  // Create sample files
  const sampleFiles = await Promise.all([
    prisma.file.create({
      data: {
        uploadId: sampleUpload.id,
        fileName: 'document1.pdf',
        filePath: '/uploads/document1.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048576,
        sha256: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890',
        textExcerpt: 'This is a sample PDF document with important information...',
        processedAt: new Date(),
        fileMetadata: {
          pages: 10,
          author: 'Test Author',
        },
      },
    }),
    prisma.file.create({
      data: {
        uploadId: sampleUpload.id,
        fileName: 'document1_copy.pdf',
        filePath: '/uploads/document1_copy.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 2048576,
        sha256: 'a1b2c3d4e5f6789012345678901234567890123456789012345678901234567890', // Same hash - duplicate!
        textExcerpt: 'This is a sample PDF document with important information...',
        processedAt: new Date(),
        fileMetadata: {
          pages: 10,
          author: 'Test Author',
        },
      },
    }),
    prisma.file.create({
      data: {
        uploadId: sampleUpload.id,
        fileName: 'image1.jpg',
        filePath: '/uploads/image1.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024768,
        sha256: 'b2c3d4e5f6789012345678901234567890123456789012345678901234567890ab',
        phash: 'a1b2c3d4e5f67890',
        processedAt: new Date(),
        fileMetadata: {
          width: 1920,
          height: 1080,
          exif: {
            camera: 'iPhone 14',
            date: '2024-01-15',
          },
        },
      },
    }),
  ]);

  console.log('✅ Created sample files:', sampleFiles.map(f => f.fileName));

  // Create sample embeddings
  const sampleEmbeddings = await Promise.all([
    prisma.fileEmbedding.create({
      data: {
        fileId: sampleFiles[0].id,
        kind: 'text',
        modelName: 'distilbert-base-uncased',
        embedding: Array.from({ length: 768 }, () => Math.random() - 0.5),
      },
    }),
    prisma.fileEmbedding.create({
      data: {
        fileId: sampleFiles[1].id,
        kind: 'text',
        modelName: 'distilbert-base-uncased',
        embedding: Array.from({ length: 768 }, () => Math.random() - 0.5),
      },
    }),
    prisma.fileEmbedding.create({
      data: {
        fileId: sampleFiles[2].id,
        kind: 'image',
        modelName: 'clip-vit-base-patch32',
        embeddingImg: Array.from({ length: 512 }, () => Math.random() - 0.5),
      },
    }),
  ]);

  console.log('✅ Created sample embeddings');

  // Create duplicate group
  const dedupeGroup = await prisma.dedupeGroup.create({
    data: {
      uploadId: sampleUpload.id,
      groupHash: 'duplicate_group_1',
      similarityScore: 1.0,
      detectionMethod: 'sha256',
      keepCandidateId: sampleFiles[0].id,
      totalSizeBytes: sampleFiles[0].sizeBytes + sampleFiles[1].sizeBytes,
      potentialSavings: sampleFiles[1].sizeBytes,
      groupMetadata: {
        fileIds: [sampleFiles[0].id, sampleFiles[1].id],
        duplicateType: 'exact_match',
      },
    },
  });

  console.log('✅ Created duplicate group:', dedupeGroup.id);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample accounts:');
  console.log(`   Admin: admin@ai-cleanup.com / admin123`);
  console.log(`   Test:  test@ai-cleanup.com / test123`);
  console.log('\n🔑 Sample license keys:');
  console.log(`   Admin: ${adminLicense.key}`);
  console.log(`   Test:  ${testLicense.key}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
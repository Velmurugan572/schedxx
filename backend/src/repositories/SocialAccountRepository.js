import prisma from '../database/prisma.js';

export class SocialAccountRepository {
  async findById(id) {
    return prisma.socialAccount.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        integration: true
      }
    });
  }

  async findByWorkspaceId(workspaceId) {
    return prisma.socialAccount.findMany({
      where: {
        integration: {
          workspaceId
        },
        deletedAt: null
      }
    });
  }
}

export default new SocialAccountRepository();

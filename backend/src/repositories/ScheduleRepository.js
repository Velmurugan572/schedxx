import prisma from '../database/prisma.js';

export class ScheduleRepository {
  async createSchedule(data) {
    return prisma.schedule.create({
      data: {
        postId: data.postId,
        socialAccountId: data.socialAccountId,
        scheduledAt: data.scheduledAt,
        status: data.status || 'PENDING'
      }
    });
  }

  async createDestination(data) {
    return prisma.postDestination.create({
      data: {
        postId: data.postId,
        socialAccountId: data.socialAccountId,
        scheduleId: data.scheduleId,
        status: data.status || 'PENDING'
      }
    });
  }

  async findById(id) {
    return prisma.schedule.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        post: true,
        socialAccount: true
      }
    });
  }

  async findByWorkspaceId(workspaceId) {
    return prisma.schedule.findMany({
      where: {
        post: {
          workspaceId,
          deletedAt: null
        },
        deletedAt: null
      },
      include: {
        post: true,
        socialAccount: true
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });
  }

  async findDestinationByScheduleId(scheduleId) {
    return prisma.postDestination.findFirst({
      where: {
        scheduleId,
        deletedAt: null
      }
    });
  }

  async updateSchedule(id, data) {
    return prisma.schedule.update({
      where: { id },
      data
    });
  }

  async updateDestination(id, data) {
    return prisma.postDestination.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    return prisma.schedule.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export default new ScheduleRepository();

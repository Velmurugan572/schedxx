// ==========================================
// Post Management Unit Tests (post.unit.test.js)
// ==========================================

import PostService from '../services/PostService.js';
import PostRepository from '../repositories/PostRepository.js';
import WorkspaceMemberRepository from '../repositories/WorkspaceMemberRepository.js';
import { AppError } from '../errors/AppError.js';

jest.mock('../repositories/PostRepository.js', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
    findByWorkspaceId: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

jest.mock('../repositories/WorkspaceMemberRepository.js', () => ({
  __esModule: true,
  default: {
    findByWorkspaceAndUser: jest.fn()
  }
}));

describe('PostService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a post when the user is a workspace member', async () => {
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue({ deletedAt: null });
    PostRepository.create.mockResolvedValue({ id: 'post-1' });

    const result = await PostService.createPost({ workspaceId: 'ws-1', userId: 'user-1', content: 'Hello' });

    expect(result.id).toBe('post-1');
    expect(PostRepository.create).toHaveBeenCalled();
  });

  it('lists posts for a workspace member', async () => {
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue({ deletedAt: null });
    PostRepository.findByWorkspaceId.mockResolvedValue([{ id: 'post-1' }]);

    const result = await PostService.getWorkspacePosts('ws-1', 'user-1');

    expect(result).toHaveLength(1);
    expect(PostRepository.findByWorkspaceId).toHaveBeenCalledWith('ws-1');
  });

  it('retrieves a post for a workspace member', async () => {
    PostRepository.findById.mockResolvedValue({ id: 'post-1', workspaceId: 'ws-1' });
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue({ deletedAt: null });

    const result = await PostService.getPost('post-1', 'user-1');

    expect(result.id).toBe('post-1');
  });

  it('rejects create if the user is not a workspace member', async () => {
    WorkspaceMemberRepository.findByWorkspaceAndUser.mockResolvedValue(null);

    await expect(PostService.createPost({ workspaceId: 'ws-1', userId: 'user-1', content: 'Hello' })).rejects.toBeInstanceOf(AppError);
  });

  it('rejects update when the current user is not the author', async () => {
    PostRepository.findById.mockResolvedValue({ id: 'post-1', userId: 'author-1' });

    await expect(PostService.updatePost('post-1', 'user-1', { title: 'New' })).rejects.toBeInstanceOf(AppError);
  });

  it('rejects delete when the current user is not the author', async () => {
    PostRepository.findById.mockResolvedValue({ id: 'post-1', userId: 'author-1' });

    await expect(PostService.deletePost('post-1', 'user-1')).rejects.toBeInstanceOf(AppError);
  });
});

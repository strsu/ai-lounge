import { NextRequest, NextResponse } from 'next/server'
import { getPrismaClient } from '@/lib/db'

// Disable static generation for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * 특정 포스팅 조회
 * GET /api/admin/posts/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const postId = (await params).id
    const prisma = getPrismaClient()

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        cafe: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true
          }
        },
        reviews: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: '해당 포스팅을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json(
      { error: '포스팅 정보를 불러오는 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 포스팅 정보 수정
 * PUT /api/admin/posts/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const postId = (await params).id
    const prisma = getPrismaClient()

    const body = await request.json()

    // 포스팅 존재 여부 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: '해당 포스팅을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 포스팅 정보 업데이트
    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        source: body.source !== undefined ? body.source : existingPost.source,
        url: body.url !== undefined ? body.url : existingPost.url,
        title: body.title !== undefined ? body.title : existingPost.title,
        content: body.content !== undefined ? body.content : existingPost.content,
        thumbnail: body.thumbnail !== undefined ? body.thumbnail : existingPost.thumbnail,
        metadata: body.metadata !== undefined ? body.metadata : existingPost.metadata
      },
      include: {
        cafe: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      post,
      message: '포스팅 정보가 수정되었습니다'
    })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json(
      { error: '포스팅 정보 수정 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

/**
 * 포스팅 삭제
 * DELETE /api/admin/posts/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const postId = (await params).id
    const prisma = getPrismaClient()

    // 포스팅 존재 여부 확인
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: '해당 포스팅을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 포스팅 삭제 (연관된 리뷰도 CASCADE로 삭제됨)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({
      message: '포스팅이 삭제되었습니다'
    })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json(
      { error: '포스팅 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

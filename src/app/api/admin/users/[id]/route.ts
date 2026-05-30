import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

async function checkAdminAuth() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded || decoded.role !== 'ADMIN') return null;
  return decoded;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = params;

  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required.' },
        { status: 400 }
      );
    }

    if (role !== 'ADMIN' && role !== 'SALES_OFFICER') {
      return NextResponse.json(
        { error: 'Role must be either ADMIN or SALES_OFFICER.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: trimmedEmail,
        NOT: { id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email address already exists.' },
        { status: 400 }
      );
    }

    const updateData: any = {
      name: name.trim(),
      email: trimmedEmail,
      role,
    };

    // Hash and update the password if a new one is provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const admin = await checkAdminAuth();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = params;

  // Prevent admin from deleting their own active session
  if (admin.id === id) {
    return NextResponse.json(
      { error: 'Self-deletion is blocked. You cannot delete your currently active Administrator session.' },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'User account deleted successfully.' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    // Prisma ForeignKeyConstraintViolation code is P2003
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete this user because they have active sales logs. Please delete their sales logs first.' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const updateSettingsSchema = z.object({
  whatsappMessage: z.string().optional(),
  enableTips: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  newPin: z.string().optional(),
  currentPin: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo dueños pueden editar configuración
    if (session.user.role !== 'DUENO') {
      return NextResponse.json(
        { error: 'No tienes permisos para esta acción' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = updateSettingsSchema.parse(body)

    const settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: session.user.tenantId },
    })

    if (!settings) {
      return NextResponse.json(
        { error: 'Configuración no encontrada' },
        { status: 404 }
      )
    }

    // Si se quiere cambiar el PIN, verificar el actual
    if (data.newPin) {
      if (!data.currentPin) {
        return NextResponse.json(
          { error: 'Debes ingresar el PIN actual para cambiarlo' },
          { status: 400 }
        )
      }

      const isValidPin = await bcrypt.compare(data.currentPin, settings.managerPin)

      if (!isValidPin) {
        return NextResponse.json(
          { error: 'PIN actual incorrecto' },
          { status: 401 }
        )
      }

      // Encriptar nuevo PIN
      updateData.managerPin = await bcrypt.hash(data.newPin, 10)
    }

    const updateData: any = {}
    if (data.whatsappMessage !== undefined) updateData.whatsappMessage = data.whatsappMessage
    if (data.enableTips !== undefined) updateData.enableTips = data.enableTips
    if (data.notes !== undefined) updateData.notes = data.notes
    // managerPin ya se asignó arriba si corresponde

    const updated = await prisma.tenantSettings.update({
      where: { tenantId: session.user.tenantId },
      data: updateData,
    })

    // No retornar el PIN
    const { managerPin, ...safeSettings } = updated

    return NextResponse.json(safeSettings)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}


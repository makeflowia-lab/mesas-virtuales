'use client'

import { Share2 } from 'lucide-react'

interface ShareTicketButtonProps {
  ticketUrl: string
  whatsappMessage: string
  phoneNumber: string
}

export function ShareTicketButton({
  ticketUrl,
  whatsappMessage,
  phoneNumber,
}: ShareTicketButtonProps) {
  const handleShare = () => {
    // Crear mensaje para WhatsApp
    const message = encodeURIComponent(
      `${whatsappMessage}\n\nVer ticket: ${ticketUrl}`
    )
    
    // Abrir WhatsApp Web o móvil
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`
    
    window.open(whatsappUrl, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="btn-primary flex items-center space-x-2 w-full"
    >
      <Share2 size={20} />
      <span>Compartir por WhatsApp</span>
    </button>
  )
}










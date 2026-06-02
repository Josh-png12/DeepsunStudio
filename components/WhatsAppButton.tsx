'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WA_URL =
  'https://wa.me/573971496476?text=' +
  encodeURIComponent('Hola Joshua, vi tu portafolio y me interesa hablar sobre un proyecto')

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escríbeme por WhatsApp"
          title="Escríbeme por WhatsApp"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="whatsapp-btn fixed bottom-6 right-6 z-[999] flex items-center justify-center
                     w-14 h-14 md:w-14 md:h-14 rounded-full bg-[#25D366] shadow-lg
                     hover:scale-110 active:scale-95 transition-transform
                     group"
          style={{ width: undefined, height: undefined }}
        >
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-wa-pulse" />

          {/* WhatsApp SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            fill="white"
            className="relative z-10 w-7 h-7"
            aria-hidden="true"
          >
            <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.363.627 4.673 1.817 6.697L2.667 29.333l6.82-1.787A13.27 13.27 0 0 0 16.003 29.333C23.363 29.333 29.333 23.363 29.333 16S23.363 2.667 16.003 2.667zm0 24.267a11.02 11.02 0 0 1-5.62-1.543l-.403-.24-4.047 1.06 1.08-3.94-.263-.413A10.987 10.987 0 0 1 5.003 16c0-6.06 4.94-11 11-11s11 4.94 11 11-4.94 11-11 11zm6.027-8.24c-.33-.167-1.953-.963-2.257-1.073-.303-.11-.523-.167-.743.167-.22.33-.853 1.073-.047 1.297-.22.33-.847 1.073-1.043 1.293-.197.22-.393.247-.727.083-.333-.167-1.41-.52-2.687-1.657-.993-.887-1.663-1.98-1.857-2.313-.193-.333-.02-.513.147-.68.15-.15.333-.39.5-.587.167-.197.22-.333.333-.553.113-.22.057-.413-.027-.58-.083-.167-.743-1.793-1.017-2.457-.267-.643-.54-.557-.743-.567-.193-.007-.413-.01-.633-.01s-.58.083-.883.413c-.303.33-1.157 1.13-1.157 2.757s1.183 3.197 1.35 3.417c.167.22 2.327 3.553 5.64 4.983.787.34 1.403.543 1.883.697.79.25 1.51.215 2.08.13.633-.093 1.953-.8 2.227-1.573.273-.773.273-1.437.19-1.573-.08-.137-.3-.22-.63-.387z" />
          </svg>

          {/* Tooltip */}
          <span
            className="absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5
                       text-xs font-medium text-white opacity-0 group-hover:opacity-100
                       transition-opacity duration-200 pointer-events-none"
          >
            Escríbeme por WhatsApp
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}

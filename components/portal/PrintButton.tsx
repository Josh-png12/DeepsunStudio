'use client'

export function PrintButton() {
  return (
    <button className="portal-button portal-button-primary" type="button" onClick={() => window.print()}>
      Imprimir o guardar PDF
    </button>
  )
}


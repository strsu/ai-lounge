import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '맛집 포스팅 요약 플랫폼',
  description: '네이버에서 동일한 맛집의 여러 포스팅을 수집하고, 공통점(DO)과 차이점(DONT)을 분석하여 제공하는 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}

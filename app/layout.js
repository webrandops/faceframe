export const metadata = {
  title: 'FaceFrame Studio',
  description: 'AI Poster Generator',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0, background:'#0a0a0a', color:'#f5f0e8', fontFamily:'sans-serif'}}>
        {children}
      </body>
    </html>
  )
}

import './globals.css';
export const metadata = { title: 'Luana · Una noche encantada', description: 'Mis quince. Una invitación a una noche de sueños, luces y magia.' };
export default function RootLayout({children}) { return <html lang="es"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet"/></head><body>{children}</body></html>; }

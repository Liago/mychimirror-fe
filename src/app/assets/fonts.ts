import {Cinzel, Open_Sans } from 'next/font/google'
 
 
export const openSans = Open_Sans({
  weight: ['400', '600', '800'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export const cinzel = Cinzel({
    weight: ['400', '600', '800'],
    style: ['normal'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-cinzel',
  })
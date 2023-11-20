import Image from 'next/image'
import Text from '@/components/Typography/Text'
import Button from '@/components/Buttons/Button'

/*
  This is the home page component, meaning it should remain a server-side component. Therefore,
  for button-testing purposes, we must create a client component that handles the interactivity logic
  between the user and the button, and nest the button in said client component.
*/
// import Button from '@/components/Buttons/Button'
import ClientComponent from '@/components/ClientComponent'

export default function Home() {

  return (
    <main>
      <ClientComponent/>
    </main>
  )
}
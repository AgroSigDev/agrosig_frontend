import LoginContent from './LoginContent'

export default function LoginPage({ searchParams }) {
  const message = searchParams?.message || ''

  return <LoginContent initialMessage={message} />
}
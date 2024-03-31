import React from 'react'
import CreateDateForm from './CreateDateForm'
import Link from 'next/link'

export default function newDate() {

  

  return (
    <>
    <Link href={'/'}>Home</Link>
    <div>newDate</div>
    <CreateDateForm/>
    </>
  )
}

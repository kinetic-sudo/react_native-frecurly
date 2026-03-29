import { Link } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const SignUp = () => {
  return (
    <View>
      <Text>SignUp</Text>
      <Link href='/(auth)/Sign-up'>Create Account</Link>
    </View>
  )
}

export default SignUp
import { Tabs } from 'expo-router'
import React from 'react'

const TabLayout = () => (
    <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name='index' options={{ title: 'Home' }}/>
    </Tabs>
)

export default TabLayout
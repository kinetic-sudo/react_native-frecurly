import { Tabs } from 'expo-router'
import React from 'react'

const TabLayout = () => (
    <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen name='index' options={{ title: 'Home' }}/>
        <Tabs.Screen name='Subscriptions' options={{ title: 'Subscriptions' }}/>
        <Tabs.Screen name='insights' options={{ title: 'Insights' }}/>
        <Tabs.Screen name='settings' options={{ title: 'Settings' }}/>
        <Tabs.Screen name='Subscriptions/[id]' options={{ href: null }}/>

    </Tabs>
)

export default TabLayout
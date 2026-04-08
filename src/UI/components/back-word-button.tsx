import View from '@/components/ui/view'
import { useIconColors } from '@/hooks/use-icon-colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'

export default function BackWordButton() {
  const { foreground } = useIconColors();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      className="w-9 h-9 rounded-full p-3"
    >
      <View className='p-2 bg-muted min-w-max'>
        <Ionicons name="chevron-back" size={22} color={foreground} />
      </View>
    </Pressable>

  )
}

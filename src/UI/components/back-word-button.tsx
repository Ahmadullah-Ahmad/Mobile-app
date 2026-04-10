import { useIconColors } from '@/hooks/use-icon-colors'
import { useDirection } from '@/lib/i18n-provider'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable } from 'react-native'

export default function BackWordButton() {
  const { foreground } = useIconColors();
  const { chevronBack } = useDirection();
  return (
    <Pressable
      onPress={() => router.back()}
      hitSlop={8}
      className="w-9 h-9 items-center justify-center rounded-full bg-muted"
    >
      <Ionicons name={chevronBack} size={22} color={foreground} />
    </Pressable>
  )
}

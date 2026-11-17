import type { JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";

import "../global.css";

export default function RootLayout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}

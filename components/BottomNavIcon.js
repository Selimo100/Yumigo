import { Ionicons } from '@expo/vector-icons';

export default function BottomNavIcon({ name, color }) {
  return (
    <Ionicons
      size={28}
      name={name}
      color={color}
    />
  );
}
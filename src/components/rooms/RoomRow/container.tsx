import type { RoomSummary } from "@/types/room";
import { RoomRowView } from "./index";

interface Props {
  room: RoomSummary;
  onOpen: () => void;
}

export function RoomRow({ room, onOpen }: Props) {
  return <RoomRowView room={room} full={room.players >= room.maxPlayers} onOpen={onOpen} />;
}

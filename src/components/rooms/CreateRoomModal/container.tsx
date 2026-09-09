import { useState } from "react";
import { useRoomStore } from "@/stores/roomStore";
import { CreateRoomModalView } from "./index";

const FORMAT = "commander";

export function CreateRoomModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (code: string) => void;
}) {
  const { create, loading, error } = useRoomStore();

  const [name, setName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [allowSpectators, setAllowSpectators] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [password, setPassword] = useState("");

  async function submit() {
    const room = await create({
      name: name.trim() || "Mesa de Magic",
      format: FORMAT,
      maxPlayers,
      allowSpectators,
      isPublic,
      password: password.trim() || undefined,
    });
    onCreated(room.code);
  }

  return (
    <CreateRoomModalView
      name={name}
      maxPlayers={maxPlayers}
      allowSpectators={allowSpectators}
      isPublic={isPublic}
      password={password}
      loading={loading}
      error={error}
      onNameChange={setName}
      onMaxPlayersChange={setMaxPlayers}
      onAllowSpectatorsChange={setAllowSpectators}
      onIsPublicChange={setIsPublic}
      onPasswordChange={setPassword}
      onSubmit={() => void submit()}
      onClose={onClose}
    />
  );
}

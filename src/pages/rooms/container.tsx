import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useRoomStore } from "@/stores/roomStore";
import { RoomsView } from "./index";

export function RoomsPage() {
  const { publicRooms, loadPublic, error } = useRoomStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    void loadPublic();
    const t = setInterval(() => void loadPublic(), 5000);
    return () => clearInterval(t);
  }, [loadPublic]);

  const codeReady = joinCode.trim().length >= 4;

  function onSubmitJoin(e: FormEvent) {
    e.preventDefault();
    if (codeReady) navigate(`/play/${joinCode.trim().toUpperCase()}`);
  }

  return (
    <RoomsView
      publicRooms={publicRooms}
      error={error}
      createOpen={createOpen}
      joinCode={joinCode}
      codeReady={codeReady}
      onJoinCodeChange={setJoinCode}
      onOpenCreate={() => setCreateOpen(true)}
      onCloseCreate={() => setCreateOpen(false)}
      onSubmitJoin={onSubmitJoin}
      onOpenRoom={(code) => navigate(`/play/${code}`)}
      onCreated={(code) => navigate(`/play/${code}`)}
    />
  );
}
